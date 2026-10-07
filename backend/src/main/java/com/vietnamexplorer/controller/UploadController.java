package com.vietnamexplorer.controller;

import com.vietnamexplorer.exception.ApiException;
import com.vietnamexplorer.service.UploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.Path;
import java.time.Duration;

/** Serves uploaded photos publicly. File names are random UUIDs, so they can be cached forever. */
@RestController
@RequiredArgsConstructor
public class UploadController {

    private final UploadService uploads;

    @GetMapping("/api/uploads/{name:.+}")
    public ResponseEntity<Resource> get(@PathVariable String name) {
        Path file = uploads.resolve(name);
        if (file == null) throw ApiException.notFound("Không tìm thấy ảnh");
        MediaType type = name.endsWith(".png") ? MediaType.IMAGE_PNG
                : name.endsWith(".webp") ? MediaType.parseMediaType("image/webp")
                : MediaType.IMAGE_JPEG;
        return ResponseEntity.ok()
                .contentType(type)
                .cacheControl(CacheControl.maxAge(Duration.ofDays(365)).cachePublic().immutable())
                .body(new FileSystemResource(file));
    }
}
