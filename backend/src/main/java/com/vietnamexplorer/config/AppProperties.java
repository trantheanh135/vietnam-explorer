package com.vietnamexplorer.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/**
 * Settings under "app." in application.yml; secrets come from environment variables
 * (APP_ADMIN_PASSWORD, APP_JWT_SECRET) set by the k8s Secret.
 */
@ConfigurationProperties(prefix = "app")
public record AppProperties(Admin admin, Jwt jwt, Cors cors, Uploads uploads, Video video) {

    public record Admin(String username, String password) {}

    public record Jwt(String secret, long ttlHours) {}

    public record Cors(List<String> origins) {}

    public record Uploads(String dir, long maxBytes) {}

    /**
     * AI video generation (Google Veo via the Gemini API) and storage (Vercel Blob).
     * Generation is enabled only when both the Gemini key and the Blob token are set.
     */
    public record Video(
            String geminiApiKey,
            String geminiBaseUrl,
            String model,
            String resolution,
            int durationSeconds,
            double pricePerSecond,
            int dailyLimit,
            String blobToken,
            String blobApiUrl,
            int timeoutMinutes
    ) {
        public boolean enabled() {
            return geminiApiKey != null && !geminiApiKey.isBlank() && blobToken != null && !blobToken.isBlank();
        }

        public double costPerVideo() {
            return Math.round(pricePerSecond * durationSeconds * 100) / 100.0;
        }
    }
}
