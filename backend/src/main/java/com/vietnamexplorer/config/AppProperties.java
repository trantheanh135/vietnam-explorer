package com.vietnamexplorer.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/**
 * Settings under "app." in application.yml; secrets come from environment variables
 * (APP_ADMIN_PASSWORD, APP_JWT_SECRET) set by the k8s Secret.
 */
@ConfigurationProperties(prefix = "app")
public record AppProperties(Admin admin, Jwt jwt, Cors cors, Uploads uploads) {

    public record Admin(String username, String password) {}

    public record Jwt(String secret, long ttlHours) {}

    public record Cors(List<String> origins) {}

    public record Uploads(String dir, long maxBytes) {}
}
