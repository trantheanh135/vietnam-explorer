package com.vietnamexplorer.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vietnamexplorer.config.AppProperties;
import com.vietnamexplorer.exception.ApiException;
import com.vietnamexplorer.model.Place;
import com.vietnamexplorer.model.VideoJob;
import com.vietnamexplorer.repository.PlaceRepository;
import com.vietnamexplorer.repository.VideoJobRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Short AI videos for places: Google Veo animates the place's real photo (image-to-video), then the
 * MP4 is copied to Vercel Blob (Google deletes generated videos after 2 days, and serving video
 * through the free ngrok tunnel would use up its 1 GB/month).
 *
 * Flow: start() submits a long-running Veo operation → poll() (scheduled) checks it → when done the
 * video is downloaded, uploaded to Blob and the place gets its videoUrl.
 */
@Service
public class VideoService {

    private static final Logger log = LoggerFactory.getLogger(VideoService.class);
    private static final ZoneId VIETNAM = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final String UA = "VietnamExplorer/1.0 (+https://vietnam-explorer-nu.vercel.app)";

    private final AppProperties.Video cfg;
    private final PlaceRepository places;
    private final VideoJobRepository jobs;
    private final UploadService uploads;
    private final ObjectMapper json;
    private final HttpClient http = HttpClient.newBuilder()
            .followRedirects(HttpClient.Redirect.NORMAL)
            .connectTimeout(Duration.ofSeconds(20))
            .build();

    public VideoService(AppProperties props, PlaceRepository places, VideoJobRepository jobs,
                        UploadService uploads, ObjectMapper json) {
        this.cfg = props.video();
        this.places = places;
        this.jobs = jobs;
        this.uploads = uploads;
        this.json = json;
    }

    // ---------------------------------------------------------------- status for the admin page

    public Map<String, Object> config() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("enabled", cfg.enabled());
        m.put("missing", cfg.enabled() ? null : missingSetting());
        m.put("model", cfg.model());
        m.put("durationSeconds", cfg.durationSeconds());
        m.put("resolution", cfg.resolution());
        m.put("costPerVideo", cfg.costPerVideo());
        m.put("dailyLimit", cfg.dailyLimit());
        m.put("usedToday", jobs.countByStartedAtAfter(startOfToday()));
        m.put("totalCost", Math.round(jobs.totalCost() * 100) / 100.0);
        return m;
    }

    public List<VideoJob> recentJobs() {
        return jobs.findTop20ByOrderByStartedAtDesc();
    }

    // ---------------------------------------------------------------- start

    @Transactional
    public Place start(String placeId, String customPrompt) {
        if (!cfg.enabled()) throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Chưa cấu hình tạo video AI: thiếu " + missingSetting());
        Place p = places.findById(placeId).orElseThrow(() -> ApiException.notFound("Không tìm thấy địa điểm"));
        if ("generating".equals(p.getVideoStatus())) throw ApiException.conflict("Video của địa điểm này đang được tạo");
        if (p.getImageSrc() == null) throw ApiException.badRequest("Cần có ảnh trước: video được tạo bằng cách làm chuyển động ảnh thật của địa điểm");
        if (jobs.countByStartedAtAfter(startOfToday()) >= cfg.dailyLimit())
            throw ApiException.tooManyRequests("Đã đạt giới hạn " + cfg.dailyLimit() + " video mỗi ngày. Thử lại vào ngày mai.");

        Image image = loadImage(p.getImageSrc());
        String prompt = customPrompt != null && !customPrompt.isBlank() ? customPrompt.trim() : defaultPrompt(p);

        Map<String, Object> body = Map.of(
                "instances", List.of(Map.of(
                        "prompt", prompt,
                        "image", Map.of("inlineData", Map.of(
                                "mimeType", image.mimeType(),
                                "data", Base64.getEncoder().encodeToString(image.bytes())))
                )),
                "parameters", Map.of(
                        "aspectRatio", "16:9",
                        "resolution", cfg.resolution(),
                        "durationSeconds", String.valueOf(cfg.durationSeconds()),
                        "personGeneration", "allow_adult"
                ));
        JsonNode res = gemini("POST", "/v1beta/models/" + cfg.model() + ":predictLongRunning", body);
        String operation = res.path("name").asText(null);
        if (operation == null) throw new ApiException(HttpStatus.BAD_GATEWAY, "Veo không trả về mã tác vụ");

        VideoJob job = new VideoJob();
        job.setPlaceId(placeId);
        job.setModel(cfg.model());
        job.setStatus("generating");
        job.setPrompt(prompt.length() > 1000 ? prompt.substring(0, 1000) : prompt);
        job.setStartedAt(Instant.now());
        jobs.save(job);

        p.setVideoStatus("generating");
        p.setVideoError(null);
        p.setVideoOperation(operation);
        p.setVideoModel(cfg.model());
        p.setVideoStartedAt(Instant.now());
        return places.save(p);
    }

    // ---------------------------------------------------------------- poll

    @Scheduled(fixedDelayString = "${app.video.poll-ms:10000}", initialDelayString = "${app.video.poll-ms:10000}")
    public void pollAll() {
        if (!cfg.enabled()) return;
        for (Place p : places.findByVideoStatus("generating")) {
            try {
                poll(p.getId());
            } catch (Exception e) {
                log.warn("Polling video for {} failed", p.getId(), e);
            }
        }
    }

    @Transactional
    public void poll(String placeId) {
        Place p = places.findById(placeId).orElse(null);
        if (p == null || !"generating".equals(p.getVideoStatus())) return;
        VideoJob job = jobs.findFirstByPlaceIdAndStatusOrderByStartedAtDesc(placeId, "generating").orElse(null);

        if (p.getVideoStartedAt() != null
                && p.getVideoStartedAt().isBefore(Instant.now().minus(Duration.ofMinutes(cfg.timeoutMinutes())))) {
            fail(p, job, "Quá thời gian chờ (" + cfg.timeoutMinutes() + " phút)");
            return;
        }

        JsonNode op = gemini("GET", "/v1beta/" + p.getVideoOperation(), null);
        if (!op.path("done").asBoolean(false)) return;

        if (op.has("error")) {
            fail(p, job, "Veo báo lỗi: " + op.path("error").path("message").asText("không rõ"));
            return;
        }
        JsonNode resp = op.path("response").path("generateVideoResponse");
        String uri = resp.path("generatedSamples").path(0).path("video").path("uri").asText(null);
        if (uri == null) {
            String reason = resp.path("raiFilteredReasons").path(0).asText(null);
            fail(p, job, reason != null ? "Bị bộ lọc an toàn của Google chặn: " + reason : "Veo không trả về video");
            return;
        }

        byte[] mp4 = download(uri);
        String url = uploadToBlob("videos/" + placeId + ".mp4", mp4);
        String old = p.getVideoUrl();

        p.setVideoUrl(url);
        p.setVideoStatus("ready");
        p.setVideoError(null);
        p.setVideoOperation(null);
        places.save(p);
        if (job != null) {
            job.setStatus("ready");
            job.setCost(cfg.costPerVideo());
            job.setFinishedAt(Instant.now());
            jobs.save(job);
        }
        if (old != null && !old.equals(url)) deleteFromBlob(old);
        log.info("Video ready for {} ({} KB)", placeId, mp4.length / 1024);
    }

    // ---------------------------------------------------------------- remove

    @Transactional
    public Place remove(String placeId) {
        Place p = places.findById(placeId).orElseThrow(() -> ApiException.notFound("Không tìm thấy địa điểm"));
        if (p.getVideoUrl() != null) deleteFromBlob(p.getVideoUrl());
        clear(p);
        return places.save(p);
    }

    /** Called when a place is deleted. */
    public void deleteVideoOf(Place p) {
        if (p.getVideoUrl() != null) deleteFromBlob(p.getVideoUrl());
    }

    // ---------------------------------------------------------------- helpers

    /** Animate the real photo, gently: the place must still look like itself. */
    static String defaultPrompt(Place p) {
        boolean food = "food".equals(p.getCategory());
        String keep = " Keep everything exactly as in the photo: same scene, layout, colours and objects."
                + " Do not add people, text, logos or watermarks. Photorealistic, no style change.";
        if (food) {
            return "A short, appetising close-up video of " + p.getNameEn() + " (" + p.getNameVi() + "), a Vietnamese dish,"
                    + " served at " + (p.getVenue() != null ? p.getVenue() : "a local eatery") + " in " + p.getArea() + "."
                    + " Gentle steam rising from the food, soft natural light, a very slow and smooth camera push-in."
                    + keep + " Ambient restaurant sound, no music, no speech.";
        }
        String tags = p.getTags() == null ? "" : p.getTags();
        StringBuilder motion = new StringBuilder();
        if (tags.contains("beach")) motion.append(" Gentle waves and sparkling water.");
        if (tags.contains("mountain")) motion.append(" Mist and clouds drifting slowly over the hills.");
        if (tags.contains("nature")) motion.append(" Leaves and grass moving softly in the breeze.");
        if (tags.contains("city") || tags.contains("heritage")) motion.append(" Subtle natural light changes, flags or lanterns stirring softly.");
        return "A calm, cinematic travel shot of " + p.getNameEn() + " (" + p.getNameVi() + ") in " + p.getArea() + ", Vietnam."
                + " Slow, smooth camera movement (gentle dolly or pan)." + motion
                + keep + " Natural ambient sound only, no music, no speech.";
    }

    private record Image(byte[] bytes, String mimeType) {}

    private Image loadImage(String src) {
        byte[] bytes;
        if (src.startsWith("uploads/")) {
            Path file = uploads.resolve(src.substring("uploads/".length()));
            if (file == null) throw ApiException.badRequest("Không tìm thấy ảnh đã tải lên");
            try {
                bytes = Files.readAllBytes(file);
            } catch (IOException e) {
                throw new IllegalStateException(e);
            }
        } else {
            HttpResponse<byte[]> r = send(HttpRequest.newBuilder(URI.create(src)).header("User-Agent", UA)
                    .timeout(Duration.ofSeconds(30)).GET().build());
            if (r.statusCode() != 200) throw new ApiException(HttpStatus.BAD_GATEWAY, "Không tải được ảnh gốc (" + r.statusCode() + ")");
            bytes = r.body();
        }
        String ext = UploadService.detectExtension(bytes.length >= 12 ? bytes : new byte[12]);
        if ("jpg".equals(ext)) return new Image(bytes, "image/jpeg");
        if ("png".equals(ext)) return new Image(bytes, "image/png");
        throw ApiException.badRequest("Veo chỉ nhận ảnh JPG hoặc PNG — hãy tải lên ảnh JPG");
    }

    private JsonNode gemini(String method, String path, Object body) {
        try {
            HttpRequest.Builder b = HttpRequest.newBuilder(URI.create(cfg.geminiBaseUrl() + path))
                    .header("x-goog-api-key", cfg.geminiApiKey())
                    .timeout(Duration.ofSeconds(60));
            if (body != null) {
                b.header("Content-Type", "application/json")
                        .method(method, HttpRequest.BodyPublishers.ofByteArray(json.writeValueAsBytes(body)));
            } else {
                b.method(method, HttpRequest.BodyPublishers.noBody());
            }
            HttpResponse<byte[]> r = send(b.build());
            JsonNode node = r.body().length == 0 ? json.createObjectNode() : json.readTree(r.body());
            if (r.statusCode() >= 300) {
                String msg = node.path("error").path("message").asText("HTTP " + r.statusCode());
                throw new ApiException(r.statusCode() == 429 ? HttpStatus.TOO_MANY_REQUESTS : HttpStatus.BAD_GATEWAY, "Google Veo: " + msg);
            }
            return node;
        } catch (IOException e) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Không đọc được phản hồi từ Google Veo");
        }
    }

    private byte[] download(String uri) {
        HttpResponse<byte[]> r = send(HttpRequest.newBuilder(URI.create(uri))
                .header("x-goog-api-key", cfg.geminiApiKey()).timeout(Duration.ofMinutes(2)).GET().build());
        if (r.statusCode() != 200) throw new ApiException(HttpStatus.BAD_GATEWAY, "Không tải được video từ Google (" + r.statusCode() + ")");
        return r.body();
    }

    /** Vercel Blob REST API (same calls as the official @vercel/blob SDK, API version 12). */
    private String uploadToBlob(String pathname, byte[] bytes) {
        HttpResponse<byte[]> r = send(blobRequest("/?pathname=" + URLEncoder.encode(pathname, StandardCharsets.UTF_8))
                .header("x-vercel-blob-access", "public")
                .header("x-content-type", "video/mp4")
                .header("x-add-random-suffix", "1")
                .header("x-cache-control-max-age", "31536000")
                .PUT(HttpRequest.BodyPublishers.ofByteArray(bytes)).build());
        try {
            JsonNode node = json.readTree(r.body());
            if (r.statusCode() >= 300 || !node.hasNonNull("url"))
                throw new ApiException(HttpStatus.BAD_GATEWAY, "Không lưu được video lên Vercel Blob (" + r.statusCode() + ")");
            return node.get("url").asText();
        } catch (IOException e) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Phản hồi lạ từ Vercel Blob");
        }
    }

    private void deleteFromBlob(String url) {
        try {
            byte[] body = json.writeValueAsBytes(Map.of("urls", List.of(url)));
            HttpResponse<byte[]> r = send(blobRequest("/delete").header("content-type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofByteArray(body)).build());
            if (r.statusCode() >= 300) log.warn("Blob delete of {} returned {}", url, r.statusCode());
        } catch (Exception e) {
            log.warn("Blob delete of {} failed", url, e);
        }
    }

    private HttpRequest.Builder blobRequest(String path) {
        String[] parts = cfg.blobToken().split("_");
        String storeId = parts.length > 3 ? parts[3] : "";
        return HttpRequest.newBuilder(URI.create(cfg.blobApiUrl() + path))
                .header("authorization", "Bearer " + cfg.blobToken())
                .header("x-api-version", "12")
                .header("x-vercel-blob-store-id", storeId)
                .timeout(Duration.ofMinutes(2));
    }

    private HttpResponse<byte[]> send(HttpRequest req) {
        try {
            return http.send(req, HttpResponse.BodyHandlers.ofByteArray());
        } catch (IOException e) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Lỗi kết nối: " + e.getMessage());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Bị gián đoạn");
        }
    }

    private void fail(Place p, VideoJob job, String reason) {
        p.setVideoStatus(p.getVideoUrl() != null ? "ready" : "failed"); // keep an older video if there was one
        p.setVideoError(reason);
        p.setVideoOperation(null);
        places.save(p);
        if (job != null) {
            job.setStatus("failed");
            job.setError(reason.length() > 400 ? reason.substring(0, 400) : reason);
            job.setFinishedAt(Instant.now());
            jobs.save(job);
        }
        log.warn("Video for {} failed: {}", p.getId(), reason);
    }

    private static void clear(Place p) {
        p.setVideoUrl(null);
        p.setVideoStatus(null);
        p.setVideoError(null);
        p.setVideoOperation(null);
        p.setVideoModel(null);
        p.setVideoStartedAt(null);
    }

    private String missingSetting() {
        boolean noKey = cfg.geminiApiKey() == null || cfg.geminiApiKey().isBlank();
        boolean noBlob = cfg.blobToken() == null || cfg.blobToken().isBlank();
        if (noKey && noBlob) return "Gemini API key và Vercel Blob token";
        return noKey ? "Gemini API key" : "Vercel Blob token";
    }

    private static Instant startOfToday() {
        return LocalDate.now(VIETNAM).atStartOfDay(VIETNAM).toInstant();
    }
}
