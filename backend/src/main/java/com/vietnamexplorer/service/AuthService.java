package com.vietnamexplorer.service;

import com.vietnamexplorer.config.AppProperties;
import com.vietnamexplorer.dto.AuthDtos.LoginResponse;
import com.vietnamexplorer.exception.ApiException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Date;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Single admin account (credentials from the k8s Secret) with short-lived JWTs.
 * Failed logins are rate-limited per client IP because the API is reachable from the internet.
 */
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final int MAX_FAILURES = 5;
    private static final Duration FAILURE_WINDOW = Duration.ofMinutes(10);

    private final String username;
    private final byte[] password;
    private final SecretKey key;
    private final Duration ttl;
    private final Map<String, Deque<Instant>> failures = new ConcurrentHashMap<>();

    public AuthService(AppProperties props) {
        this.username = props.admin().username();
        String pw = props.admin().password();
        this.password = pw == null || pw.isBlank() ? null : pw.getBytes(StandardCharsets.UTF_8);
        if (password == null) log.warn("APP_ADMIN_PASSWORD is not set: admin login is disabled");
        this.key = Keys.hmacShaKeyFor(sha256(props.jwt().secret()));
        this.ttl = Duration.ofHours(props.jwt().ttlHours());
    }

    public LoginResponse login(String user, String pass, String clientIp) {
        checkRateLimit(clientIp);
        boolean ok = password != null
                && MessageDigest.isEqual(username.getBytes(StandardCharsets.UTF_8), user.getBytes(StandardCharsets.UTF_8))
                & MessageDigest.isEqual(password, pass.getBytes(StandardCharsets.UTF_8));
        if (!ok) {
            recordFailure(clientIp);
            throw ApiException.unauthorized("Sai tên đăng nhập hoặc mật khẩu");
        }
        failures.remove(clientIp);
        Instant expires = Instant.now().plus(ttl);
        String token = Jwts.builder()
                .subject(username)
                .claim("role", "admin")
                .issuedAt(new Date())
                .expiration(Date.from(expires))
                .signWith(key)
                .compact();
        return new LoginResponse(token, expires, username);
    }

    /** True if the token is a valid, unexpired admin token. */
    public boolean isValid(String token) {
        try {
            var claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
            return username.equals(claims.getSubject()) && "admin".equals(claims.get("role"));
        } catch (Exception e) {
            return false;
        }
    }

    private void checkRateLimit(String ip) {
        Deque<Instant> q = failures.get(ip);
        if (q == null) return;
        synchronized (q) {
            Instant cutoff = Instant.now().minus(FAILURE_WINDOW);
            while (!q.isEmpty() && q.peekFirst().isBefore(cutoff)) q.pollFirst();
            if (q.size() >= MAX_FAILURES) throw ApiException.tooManyRequests("Đăng nhập sai quá nhiều lần. Thử lại sau 10 phút.");
        }
    }

    private void recordFailure(String ip) {
        Deque<Instant> q = failures.computeIfAbsent(ip, k -> new ArrayDeque<>());
        synchronized (q) {
            q.addLast(Instant.now());
        }
    }

    private static byte[] sha256(String secret) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(secret.getBytes(StandardCharsets.UTF_8));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
