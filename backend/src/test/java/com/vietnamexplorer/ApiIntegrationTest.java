package com.vietnamexplorer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:test-${random.uuid};MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE",
        "app.admin.password=test-pass",
        "app.jwt.secret=test-secret",
        "app.uploads.dir=target/test-uploads",
})
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class ApiIntegrationTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;

    private static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0x0D, 'I', 'H', 'D', 'R'};

    private String login() throws Exception {
        String body = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"admin\",\"password\":\"test-pass\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString(java.nio.charset.StandardCharsets.UTF_8);
        return "Bearer " + json.readTree(body).get("token").asText();
    }

    private Map<String, Object> food(String nameEn) {
        return new java.util.HashMap<>(Map.of(
                "category", "food", "region", "north", "nameEn", nameEn, "nameVi", "Bún thang",
                "venue", "Quán Bà Đức", "area", "Hà Nội", "lat", 21.03, "lng", 105.85,
                "descEn", "A delicate Hanoi noodle soup.", "descVi", "Món bún thanh tao của Hà Nội.")) {{
            put("rating", 4.3);
            put("price", "40.000₫");
        }};
    }

    @Test
    void seedsAndServesPublicPlaces() throws Exception {
        mvc.perform(get("/api/places")).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(56));
        mvc.perform(get("/api/places").param("category", "food"))
                .andExpect(jsonPath("$.length()").value(28))
                .andExpect(jsonPath("$[0].id").value("pho-thin"))
                .andExpect(jsonPath("$[0].image.license").exists());
        mvc.perform(get("/api/places/ha-long-bay")).andExpect(jsonPath("$.nameVi").value("Vịnh Hạ Long"));
        mvc.perform(get("/api/places/nope")).andExpect(status().isNotFound());
    }

    @Test
    void publicListRevalidatesSoAdminChangesShowImmediately() throws Exception {
        var first = mvc.perform(get("/api/places"))
                .andExpect(header().string("Cache-Control", "no-cache"))
                .andReturn().getResponse();
        String etag = first.getHeader("ETag");
        assertThat(etag).isNotBlank();
        mvc.perform(get("/api/places").header("If-None-Match", etag)).andExpect(status().isNotModified());

        mvc.perform(post("/api/admin/places").header("Authorization", login())
                        .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(food("Bún thang"))))
                .andExpect(status().isCreated());
        mvc.perform(get("/api/places").header("If-None-Match", etag)).andExpect(status().isOk());
    }

    @Test
    void adminEndpointsRequireLogin() throws Exception {
        mvc.perform(get("/api/admin/places")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/places").header("Authorization", "Bearer forged.token.here"))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"admin\",\"password\":\"wrong\"}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/places").header("Authorization", login())).andExpect(status().isOk());
    }

    @Test
    void blocksRepeatedFailedLogins() throws Exception {
        for (int i = 0; i < 5; i++) {
            mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                            .header("X-Forwarded-For", "203.0.113.9")
                            .content("{\"username\":\"admin\",\"password\":\"guess" + i + "\"}"))
                    .andExpect(status().isUnauthorized());
        }
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .header("X-Forwarded-For", "203.0.113.9")
                        .content("{\"username\":\"admin\",\"password\":\"test-pass\"}"))
                .andExpect(status().isTooManyRequests());
    }

    @Test
    void createUpdateDeleteFoodReview() throws Exception {
        String auth = login();
        String created = mvc.perform(post("/api/admin/places").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(food("Bún thang Hà Nội"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("bun-thang-ha-noi"))
                .andExpect(jsonPath("$.rating").value(4.5)) // rounded to the nearest half star
                .andReturn().getResponse().getContentAsString(java.nio.charset.StandardCharsets.UTF_8);
        assertThat(json.readTree(created).get("published").asBoolean()).isTrue();

        mvc.perform(get("/api/places").param("category", "food")).andExpect(jsonPath("$.length()").value(29));

        Map<String, Object> edit = food("Bún thang Hà Nội");
        edit.put("price", "45.000₫");
        edit.put("published", false);
        mvc.perform(put("/api/admin/places/bun-thang-ha-noi").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(edit)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.price").value("45.000₫"));
        // Unpublished: hidden from the public API, still visible to the admin.
        mvc.perform(get("/api/places/bun-thang-ha-noi")).andExpect(status().isNotFound());
        mvc.perform(get("/api/admin/places/bun-thang-ha-noi").header("Authorization", auth)).andExpect(status().isOk());

        mvc.perform(delete("/api/admin/places/bun-thang-ha-noi").header("Authorization", auth)).andExpect(status().isNoContent());
        mvc.perform(get("/api/admin/places/bun-thang-ha-noi").header("Authorization", auth)).andExpect(status().isNotFound());
    }

    @Test
    void validatesInput() throws Exception {
        String auth = login();
        Map<String, Object> bad = food("Somewhere");
        bad.put("lat", 48.85); // Paris, not Vietnam
        bad.put("region", "west");
        String body = mvc.perform(post("/api/admin/places").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(bad)))
                .andExpect(status().isBadRequest())
                .andReturn().getResponse().getContentAsString(java.nio.charset.StandardCharsets.UTF_8);
        JsonNode fields = json.readTree(body).get("fields");
        assertThat(fields.get("lat").asText()).isEqualTo("vị trí phải nằm trong Việt Nam");
        assertThat(fields.get("region").asText()).isEqualTo("phải là north, central hoặc south");
        assertThat(fields.has("region")).isTrue();

        Map<String, Object> blank = food("x");
        blank.put("descVi", " ");
        mvc.perform(post("/api/admin/places").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(blank)))
                .andExpect(jsonPath("$.fields.descVi").value("không được để trống"));

        Map<String, Object> noVenue = food("Bánh giò");
        noVenue.remove("venue");
        mvc.perform(post("/api/admin/places").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(noVenue)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Bài review món ăn cần tên quán"));

        Map<String, Object> dup = food("Duplicate");
        dup.put("id", "ha-long-bay");
        mvc.perform(post("/api/admin/places").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(dup)))
                .andExpect(status().isConflict());
    }

    @Test
    void uploadsAndServesPhotos() throws Exception {
        String auth = login();
        String body = mvc.perform(multipart("/api/admin/uploads")
                        .file(new MockMultipartFile("file", "photo.png", "image/png", PNG))
                        .header("Authorization", auth))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString(java.nio.charset.StandardCharsets.UTF_8);
        String src = json.readTree(body).get("src").asText();
        assertThat(src).matches("uploads/[a-f0-9-]{36}\\.png");

        mvc.perform(get("/api/" + src))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.IMAGE_PNG))
                .andExpect(header().string("Cache-Control", org.hamcrest.Matchers.containsString("immutable")));

        // A text file pretending to be a JPEG is rejected (type is checked from the bytes).
        mvc.perform(multipart("/api/admin/uploads")
                        .file(new MockMultipartFile("file", "evil.jpg", "image/jpeg", "<script>alert(1)</script>".getBytes()))
                        .header("Authorization", auth))
                .andExpect(status().isBadRequest());
        mvc.perform(multipart("/api/admin/uploads").file(new MockMultipartFile("file", "photo.png", "image/png", PNG)))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/uploads/..%2F..%2Fapplication.yml")).andExpect(status().isNotFound());
    }

    @Test
    void allowsCorsFromTheApp() throws Exception {
        mvc.perform(options("/api/admin/places")
                        .header("Origin", "https://vietnam-explorer-nu.vercel.app")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "authorization,content-type,ngrok-skip-browser-warning"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "https://vietnam-explorer-nu.vercel.app"));
        mvc.perform(options("/api/places")
                        .header("Origin", "https://evil.example")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isForbidden());
    }
}
