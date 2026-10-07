package com.vietnamexplorer.service;

import com.vietnamexplorer.config.AppProperties;
import com.vietnamexplorer.exception.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import java.util.regex.Pattern;

/** Stores admin photo uploads on disk (a persistent volume in k8s). */
@Service
public class UploadService {

    private static final Logger log = LoggerFactory.getLogger(UploadService.class);
    public static final Pattern FILE_NAME = Pattern.compile("[a-f0-9-]{36}\\.(jpg|png|webp)");

    private final Path dir;
    private final long maxBytes;

    public UploadService(AppProperties props) throws IOException {
        this.dir = Path.of(props.uploads().dir()).toAbsolutePath().normalize();
        this.maxBytes = props.uploads().maxBytes();
        Files.createDirectories(dir);
    }

    /** Validates the real file type from its first bytes (not the client's claim) and saves it. */
    public String save(MultipartFile file) {
        if (file == null || file.isEmpty()) throw ApiException.badRequest("Chưa chọn ảnh");
        if (file.getSize() > maxBytes) throw ApiException.badRequest("Ảnh quá lớn (tối đa " + maxBytes / 1024 / 1024 + " MB)");
        try {
            byte[] head = new byte[12];
            try (InputStream in = file.getInputStream()) {
                if (in.readNBytes(head, 0, 12) < 12) throw ApiException.badRequest("Tệp không phải ảnh");
            }
            String ext = detectExtension(head);
            if (ext == null) throw ApiException.badRequest("Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP");
            String name = UUID.randomUUID() + "." + ext;
            file.transferTo(dir.resolve(name));
            return "uploads/" + name;
        } catch (IOException e) {
            throw new IllegalStateException("Could not store upload", e);
        }
    }

    /** Returns the file for "uploads/<name>" or null; the name pattern rules out path traversal. */
    public Path resolve(String name) {
        if (!FILE_NAME.matcher(name).matches()) return null;
        Path p = dir.resolve(name).normalize();
        return p.startsWith(dir) && Files.isRegularFile(p) ? p : null;
    }

    public void delete(String src) {
        Path p = resolve(src.substring("uploads/".length()));
        if (p == null) return;
        try {
            Files.deleteIfExists(p);
        } catch (IOException e) {
            log.warn("Could not delete {}", p, e);
        }
    }

    static String detectExtension(byte[] h) {
        if ((h[0] & 0xFF) == 0xFF && (h[1] & 0xFF) == 0xD8 && (h[2] & 0xFF) == 0xFF) return "jpg";
        if ((h[0] & 0xFF) == 0x89 && h[1] == 'P' && h[2] == 'N' && h[3] == 'G') return "png";
        if (h[0] == 'R' && h[1] == 'I' && h[2] == 'F' && h[3] == 'F' && h[8] == 'W' && h[9] == 'E' && h[10] == 'B' && h[11] == 'P')
            return "webp";
        return null;
    }
}
