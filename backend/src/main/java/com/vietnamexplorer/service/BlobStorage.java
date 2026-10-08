package com.vietnamexplorer.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vietnamexplorer.config.AppProperties;
import com.vietnamexplorer.exception.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Vercel Blob REST API (the same calls as the official @vercel/blob SDK, API version 12).
 * Holds videos and animated images so they are served by Vercel's CDN, not through ngrok.
 */
@Service
public class BlobStorage {

    private static final Logger log = LoggerFactory.getLogger(BlobStorage.class);

    private final String token;
    private final String apiUrl;
    private final String storeId;
    private final ObjectMapper json;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(20)).build();

    public BlobStorage(AppProperties props, ObjectMapper json) {
        this.token = props.video().blobToken();
        this.apiUrl = props.video().blobApiUrl();
        String[] parts = token == null ? new String[0] : token.split("_");
        this.storeId = parts.length > 3 ? parts[3] : "";
        this.json = json;
    }

    public boolean configured() {
        return token != null && !token.isBlank();
    }

    /** True for a public URL of *our* Blob store (so we may delete it). */
    public boolean isOurs(String url) {
        return url != null && !storeId.isBlank()
                && url.toLowerCase(Locale.ROOT).startsWith("https://" + storeId.toLowerCase(Locale.ROOT) + ".public.blob.vercel-storage.com/");
    }

    public String upload(String pathname, byte[] bytes, String contentType) {
        HttpResponse<byte[]> r = send(request("/?pathname=" + URLEncoder.encode(pathname, StandardCharsets.UTF_8))
                .header("x-vercel-blob-access", "public")
                .header("x-content-type", contentType)
                .header("x-add-random-suffix", "1")
                .header("x-cache-control-max-age", "31536000")
                .PUT(HttpRequest.BodyPublishers.ofByteArray(bytes)).build());
        try {
            JsonNode node = json.readTree(r.body());
            if (r.statusCode() >= 300 || !node.hasNonNull("url"))
                throw new ApiException(HttpStatus.BAD_GATEWAY, "Không lưu được tệp lên Vercel Blob (" + r.statusCode() + ")");
            return node.get("url").asText();
        } catch (IOException e) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Phản hồi lạ từ Vercel Blob");
        }
    }

    /** Best effort: a failed delete only leaves an orphan file, it never blocks the admin. */
    public void delete(String url) {
        if (!configured() || url == null) return;
        try {
            byte[] body = json.writeValueAsBytes(Map.of("urls", List.of(url)));
            HttpResponse<byte[]> r = send(request("/delete").header("content-type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofByteArray(body)).build());
            if (r.statusCode() >= 300) log.warn("Blob delete of {} returned {}", url, r.statusCode());
        } catch (Exception e) {
            log.warn("Blob delete of {} failed", url, e);
        }
    }

    private HttpRequest.Builder request(String path) {
        return HttpRequest.newBuilder(URI.create(apiUrl + path))
                .header("authorization", "Bearer " + token)
                .header("x-api-version", "12")
                .header("x-vercel-blob-store-id", storeId)
                .timeout(Duration.ofMinutes(2));
    }

    private HttpResponse<byte[]> send(HttpRequest req) {
        try {
            return http.send(req, HttpResponse.BodyHandlers.ofByteArray());
        } catch (IOException e) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Lỗi kết nối Vercel Blob: " + e.getMessage());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Bị gián đoạn");
        }
    }
}
