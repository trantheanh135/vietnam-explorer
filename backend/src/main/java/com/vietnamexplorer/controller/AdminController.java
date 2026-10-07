package com.vietnamexplorer.controller;

import com.vietnamexplorer.dto.AuthDtos.UploadResponse;
import com.vietnamexplorer.dto.PlaceRequest;
import com.vietnamexplorer.dto.PlaceResponse;
import com.vietnamexplorer.service.PlaceService;
import com.vietnamexplorer.service.UploadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/** Admin-only (guarded by AdminAuthInterceptor): manage places and reviews, upload photos. */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final PlaceService places;
    private final UploadService uploads;

    @GetMapping("/places")
    public List<PlaceResponse> list(@RequestParam(required = false) String category) {
        return places.list(category, true);
    }

    @GetMapping("/places/{id}")
    public PlaceResponse get(@PathVariable String id) {
        return places.get(id, true);
    }

    @PostMapping("/places")
    @ResponseStatus(HttpStatus.CREATED)
    public PlaceResponse create(@Valid @RequestBody PlaceRequest req) {
        return places.create(req);
    }

    @PutMapping("/places/{id}")
    public PlaceResponse update(@PathVariable String id, @Valid @RequestBody PlaceRequest req) {
        return places.update(id, req);
    }

    @DeleteMapping("/places/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        places.delete(id);
    }

    @PostMapping("/uploads")
    @ResponseStatus(HttpStatus.CREATED)
    public UploadResponse upload(@RequestPart("file") MultipartFile file) {
        return new UploadResponse(uploads.save(file));
    }
}
