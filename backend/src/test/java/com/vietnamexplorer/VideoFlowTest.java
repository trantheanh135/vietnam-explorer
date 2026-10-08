package com.vietnamexplorer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import com.vietnamexplorer.service.VideoService;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** The whole AI-video flow against a fake Google Veo + Vercel Blob server (no real calls, no cost). */
@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:video-${random.uuid};MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE",
        "app.admin.password=test-pass",
        "app.jwt.secret=test-secret",
        "app.uploads.dir=target/test-uploads",
        "app.video.gemini-api-key=test-gemini-key",
        "app.video.blob-token=vercel_blob_rw_TESTSTORE_secretpart",
        "app.video.daily-limit=3",
        "app.video.poll-ms=3600000", // tests call poll() themselves
})
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class VideoFlowTest {

    // ------------------------------------------------------------------ fake Veo + Blob server
    static final HttpServer FAKE;
    static final List<String> VEO_BODIES = new CopyOnWriteArrayList<>();
    static final List<Map<String, String>> BLOB_PUTS = new CopyOnWriteArrayList<>();
    static final List<String> BLOB_DELETES = new CopyOnWriteArrayList<>();
    static final AtomicInteger POLLS_UNTIL_DONE = new AtomicInteger();
    static final AtomicInteger UPLOADS = new AtomicInteger();
    static volatile boolean FAIL_OPERATION;

    static {
        try {
            FAKE = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        } catch (IOException e) {
            throw new IllegalStateException(e);
        }
        int port = FAKE.getAddress().getPort();
        FAKE.createContext("/v1beta/", ex -> {
            String path = ex.getRequestURI().getPath();
            if (!"test-gemini-key".equals(ex.getRequestHeaders().getFirst("x-goog-api-key"))) {
                reply(ex, 403, "{\"error\":{\"message\":\"bad key\"}}");
            } else if (path.endsWith(":predictLongRunning")) {
                VEO_BODIES.add(new String(ex.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
                reply(ex, 200, "{\"name\":\"models/veo-3.1-lite-generate-preview/operations/op-" + VEO_BODIES.size() + "\"}");
            } else if (path.contains("/operations/")) {
                if (POLLS_UNTIL_DONE.getAndDecrement() > 0) {
                    reply(ex, 200, "{\"done\":false}");
                } else if (FAIL_OPERATION) {
                    reply(ex, 200, "{\"done\":true,\"error\":{\"code\":3,\"message\":\"image rejected\"}}");
                } else {
                    reply(ex, 200, "{\"done\":true,\"response\":{\"generateVideoResponse\":{\"generatedSamples\":"
                            + "[{\"video\":{\"uri\":\"http://127.0.0.1:" + port + "/files/vid:download?alt=media\"}}]}}}");
                }
            } else {
                reply(ex, 404, "{}");
            }
        });
        FAKE.createContext("/files/", ex -> {
            boolean ok = "test-gemini-key".equals(ex.getRequestHeaders().getFirst("x-goog-api-key"));
            byte[] body = ok ? "FAKE-MP4-BYTES".getBytes() : new byte[0];
            ex.sendResponseHeaders(ok ? 200 : 403, body.length == 0 ? -1 : body.length);
            if (body.length > 0) ex.getResponseBody().write(body);
            ex.close();
        });
        FAKE.createContext("/blob/", ex -> {
            var h = ex.getRequestHeaders();
            if ("PUT".equals(ex.getRequestMethod())) {
                byte[] body = ex.getRequestBody().readAllBytes();
                BLOB_PUTS.add(Map.of(
                        "query", ex.getRequestURI().getQuery(),
                        "auth", String.valueOf(h.getFirst("authorization")),
                        "version", String.valueOf(h.getFirst("x-api-version")),
                        "store", String.valueOf(h.getFirst("x-vercel-blob-store-id")),
                        "access", String.valueOf(h.getFirst("x-vercel-blob-access")),
                        "type", String.valueOf(h.getFirst("x-content-type")),
                        "body", new String(body)));
                reply(ex, 200, "{\"url\":\"https://teststore.public.blob.vercel-storage.com/videos/clip-" + UPLOADS.incrementAndGet() + ".mp4\"}");
            } else if (ex.getRequestURI().getPath().endsWith("/delete")) {
                BLOB_DELETES.add(new String(ex.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
                reply(ex, 200, "{}");
            } else {
                reply(ex, 404, "{}");
            }
        });
        FAKE.start();
    }

    static void reply(HttpExchange ex, int status, String json) throws IOException {
        byte[] b = json.getBytes(StandardCharsets.UTF_8);
        ex.getResponseHeaders().add("Content-Type", "application/json");
        ex.sendResponseHeaders(status, b.length);
        ex.getResponseBody().write(b);
        ex.close();
    }

    @DynamicPropertySource
    static void urls(DynamicPropertyRegistry r) {
        String base = "http://127.0.0.1:" + FAKE.getAddress().getPort();
        r.add("app.video.gemini-base-url", () -> base);
        r.add("app.video.blob-api-url", () -> base + "/blob");
    }

    @AfterAll
    static void stop() {
        FAKE.stop(0);
    }

    // ------------------------------------------------------------------ helpers

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired VideoService videos;

    private static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0x0D, 'I', 'H', 'D', 'R'};

    @BeforeEach
    void reset() {
        VEO_BODIES.clear();
        BLOB_PUTS.clear();
        BLOB_DELETES.clear();
        POLLS_UNTIL_DONE.set(1);
        FAIL_OPERATION = false;
    }

    private String body(org.springframework.test.web.servlet.ResultActions r) throws Exception {
        return r.andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
    }

    private String login() throws Exception {
        String b = body(mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"admin\",\"password\":\"test-pass\"}")));
        return "Bearer " + json.readTree(b).get("token").asText();
    }

    /** A travel place whose photo is an uploaded PNG. */
    private String placeWithUploadedPhoto(String auth) throws Exception {
        String src = json.readTree(body(mvc.perform(multipart("/api/admin/uploads")
                .file(new MockMultipartFile("file", "p.png", "image/png", PNG)).header("Authorization", auth)))).get("src").asText();
        Map<String, Object> place = Map.of(
                "category", "travel", "region", "central", "nameEn", "Test Lagoon", "nameVi", "Đầm Thử",
                "area", "Huế", "lat", 16.4, "lng", 107.6, "tags", List.of("beach", "nature"),
                "descEn", "A quiet lagoon used in tests.", "descVi", "Một đầm phá yên tĩnh dùng để thử.");
        Map<String, Object> withImage = new java.util.HashMap<>(place);
        withImage.put("image", Map.of("src", src));
        return json.readTree(body(mvc.perform(post("/api/admin/places").header("Authorization", auth)
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(withImage))))).get("id").asText();
    }

    // ------------------------------------------------------------------ tests

    @Test
    void generatesStoresAndServesAVideo() throws Exception {
        String auth = login();
        String id = placeWithUploadedPhoto(auth);

        mvc.perform(get("/api/admin/video/config").header("Authorization", auth))
                .andExpect(jsonPath("$.enabled").value(true))
                .andExpect(jsonPath("$.model").value("veo-3.1-lite-generate-preview"))
                .andExpect(jsonPath("$.costPerVideo").value(0.4));

        mvc.perform(post("/api/admin/places/" + id + "/video").header("Authorization", auth))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.video.status").value("generating"));

        // Veo received the real photo (base64) and a prompt about this place, image-to-video.
        JsonNode sent = json.readTree(VEO_BODIES.get(0));
        JsonNode inst = sent.path("instances").path(0);
        assertThat(Base64.getDecoder().decode(inst.path("image").path("inlineData").path("data").asText())).isEqualTo(PNG);
        assertThat(inst.path("image").path("inlineData").path("mimeType").asText()).isEqualTo("image/png");
        assertThat(inst.path("prompt").asText()).contains("Test Lagoon", "Đầm Thử", "Gentle waves", "Keep everything exactly as in the photo");
        assertThat(sent.path("parameters").path("durationSeconds").asText()).isEqualTo("8");

        // Second request for the same place while generating is refused.
        mvc.perform(post("/api/admin/places/" + id + "/video").header("Authorization", auth)).andExpect(status().isConflict());

        videos.poll(id); // not done yet
        mvc.perform(get("/api/places/" + id)).andExpect(jsonPath("$.video").doesNotExist());
        videos.poll(id); // done → download → Blob

        Map<String, String> put = BLOB_PUTS.get(0);
        assertThat(put.get("auth")).isEqualTo("Bearer vercel_blob_rw_TESTSTORE_secretpart");
        assertThat(put.get("store")).isEqualTo("TESTSTORE");
        assertThat(put.get("version")).isEqualTo("12");
        assertThat(put.get("access")).isEqualTo("public");
        assertThat(put.get("type")).isEqualTo("video/mp4");
        assertThat(put.get("query")).isEqualTo("pathname=videos/" + id + ".mp4");
        assertThat(put.get("body")).isEqualTo("FAKE-MP4-BYTES");

        // Visitors get only the finished URL; the admin also sees the status.
        mvc.perform(get("/api/places/" + id))
                .andExpect(jsonPath("$.video.url").value("https://teststore.public.blob.vercel-storage.com/videos/clip-1.mp4"))
                .andExpect(jsonPath("$.video.error").doesNotExist());
        mvc.perform(get("/api/admin/places/" + id).header("Authorization", auth))
                .andExpect(jsonPath("$.video.status").value("ready"));
        mvc.perform(get("/api/admin/video/config").header("Authorization", auth))
                .andExpect(jsonPath("$.usedToday").value(1))
                .andExpect(jsonPath("$.totalCost").value(0.4));

        // Regenerating replaces the clip and deletes the old one from Blob.
        mvc.perform(post("/api/admin/places/" + id + "/video").header("Authorization", auth)
                .contentType(MediaType.APPLICATION_JSON).content("{\"prompt\":\"Sunset over the lagoon, slow pan\"}"))
                .andExpect(status().isAccepted());
        assertThat(json.readTree(VEO_BODIES.get(1)).path("instances").path(0).path("prompt").asText())
                .isEqualTo("Sunset over the lagoon, slow pan");
        POLLS_UNTIL_DONE.set(0);
        videos.poll(id);
        mvc.perform(get("/api/places/" + id)).andExpect(jsonPath("$.video.url").value("https://teststore.public.blob.vercel-storage.com/videos/clip-2.mp4"));
        assertThat(BLOB_DELETES).anyMatch(d -> d.contains("clip-1.mp4"));

        // Removing the video deletes it from Blob too.
        mvc.perform(delete("/api/admin/places/" + id + "/video").header("Authorization", auth))
                .andExpect(jsonPath("$.video").doesNotExist());
        assertThat(BLOB_DELETES).anyMatch(d -> d.contains("clip-2.mp4"));
    }

    @Test
    void adminCanAttachUploadedVideosYoutubeLinksAndGifs() throws Exception {
        String auth = login();
        String id = placeWithUploadedPhoto(auth);
        String base = "https://teststore.public.blob.vercel-storage.com/media/";
        Map<String, Object> place = new java.util.HashMap<>(json.convertValue(
                json.readTree(body(mvc.perform(get("/api/admin/places/" + id).header("Authorization", auth)))), Map.class));
        place.keySet().removeAll(List.of("video", "createdAt", "updatedAt"));

        // YouTube short link → normalised watch URL
        place.put("videoUrl", "https://youtu.be/dQw4w9WgXcQ?si=abc");
        place.put("animatedUrl", base + "animated/lagoon-x1.gif");
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/admin/places/" + id)
                        .header("Authorization", auth).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(place)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.video.url").value("https://www.youtube.com/watch?v=dQw4w9WgXcQ"))
                .andExpect(jsonPath("$.video.model").value("youtube"))
                .andExpect(jsonPath("$.animatedUrl").value(base + "animated/lagoon-x1.gif"));
        mvc.perform(get("/api/places/" + id))
                .andExpect(jsonPath("$.video.url").value("https://www.youtube.com/watch?v=dQw4w9WgXcQ"))
                .andExpect(jsonPath("$.animatedUrl").value(base + "animated/lagoon-x1.gif"));

        // Replace with an uploaded MP4 and a new GIF: the old GIF is deleted from Blob.
        place.put("videoUrl", base + "video/lagoon-x2.mp4");
        place.put("animatedUrl", base + "animated/lagoon-x3.gif");
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/admin/places/" + id)
                        .header("Authorization", auth).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(place)))
                .andExpect(jsonPath("$.video.model").value("upload"));
        assertThat(BLOB_DELETES).anyMatch(d -> d.contains("lagoon-x1.gif"));

        // Files from elsewhere are refused (only our own store, or YouTube).
        place.put("videoUrl", "https://evil.example/clip.mp4");
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/admin/places/" + id)
                        .header("Authorization", auth).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(place)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Video phải là tệp MP4/WebM đã tải lên hoặc link YouTube"));
        place.put("videoUrl", base + "video/lagoon-x2.mp4");
        place.put("animatedUrl", "https://evil.example/a.gif");
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/admin/places/" + id)
                        .header("Authorization", auth).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(place)))
                .andExpect(status().isBadRequest());

        // Deleting the place removes its video and GIF from Blob.
        mvc.perform(delete("/api/admin/places/" + id).header("Authorization", auth)).andExpect(status().isNoContent());
        assertThat(BLOB_DELETES).anyMatch(d -> d.contains("lagoon-x2.mp4"));
        assertThat(BLOB_DELETES).anyMatch(d -> d.contains("lagoon-x3.gif"));
    }

    @Test
    void reportsFailuresAndEnforcesTheDailyLimit() throws Exception {
        String auth = login();
        String id = placeWithUploadedPhoto(auth);
        FAIL_OPERATION = true;
        POLLS_UNTIL_DONE.set(0);
        mvc.perform(post("/api/admin/places/" + id + "/video").header("Authorization", auth)).andExpect(status().isAccepted());
        videos.poll(id);
        mvc.perform(get("/api/admin/places/" + id).header("Authorization", auth))
                .andExpect(jsonPath("$.video.status").value("failed"))
                .andExpect(jsonPath("$.video.error").value("Veo báo lỗi: image rejected"));
        assertThat(BLOB_PUTS).isEmpty();

        // Limit is 3 per day in this test (failed attempts count too: they still hit Google).
        mvc.perform(post("/api/admin/places/" + id + "/video").header("Authorization", auth)).andExpect(status().isAccepted());
        videos.poll(id);
        mvc.perform(post("/api/admin/places/" + id + "/video").header("Authorization", auth)).andExpect(status().isAccepted());
        videos.poll(id);
        mvc.perform(post("/api/admin/places/" + id + "/video").header("Authorization", auth))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.error").value("Đã đạt giới hạn 3 video mỗi ngày. Thử lại vào ngày mai."));
    }

    @Test
    void needsAPhotoAndLogin() throws Exception {
        String auth = login();
        mvc.perform(post("/api/admin/places/ha-long-bay/video")).andExpect(status().isUnauthorized());
        // Seeded places use Wikimedia photos; a place without any photo is refused.
        Map<String, Object> noPhoto = Map.of(
                "category", "travel", "region", "north", "nameEn", "No Photo Hill", "nameVi", "Đồi Không Ảnh",
                "area", "Hà Nội", "lat", 21.0, "lng", 105.8,
                "descEn", "A place without a photo.", "descVi", "Một nơi chưa có ảnh.");
        String id = json.readTree(body(mvc.perform(post("/api/admin/places").header("Authorization", auth)
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(noPhoto))))).get("id").asText();
        mvc.perform(post("/api/admin/places/" + id + "/video").header("Authorization", auth))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value(org.hamcrest.Matchers.startsWith("Cần có ảnh trước")));
        assertThat(VEO_BODIES).isEmpty();
    }
}
