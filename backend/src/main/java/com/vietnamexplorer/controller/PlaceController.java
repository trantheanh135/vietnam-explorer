package com.vietnamexplorer.controller;

import com.vietnamexplorer.dto.PlaceResponse;
import com.vietnamexplorer.service.PlaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Public, read-only: what the app shows to visitors (published places only). */
@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
public class PlaceController {

    private final PlaceService places;

    @GetMapping
    public ResponseEntity<List<PlaceResponse>> list(@RequestParam(required = false) String category) {
        // no-cache = always revalidate (cheap 304 via ETag), so admin changes show up immediately.
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noCache())
                .body(places.list(category, false));
    }

    @GetMapping("/{id}")
    public PlaceResponse get(@PathVariable String id) {
        return places.get(id, false);
    }
}
