package com.vietnamexplorer.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vietnamexplorer.dto.PlaceRequest;
import com.vietnamexplorer.repository.PlaceRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.List;

/** Fills an empty database with the original 56 places (seed/places.json) on first start. */
@Component
@RequiredArgsConstructor
public class SeedService implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SeedService.class);

    private final PlaceRepository repository;
    private final PlaceService places;
    private final ObjectMapper mapper;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (repository.count() > 0) return;
        try (InputStream in = new ClassPathResource("seed/places.json").getInputStream()) {
            List<PlaceRequest> seed = mapper.readValue(in, new TypeReference<>() {});
            places.importSeed(seed);
            log.info("Seeded {} places", seed.size());
        }
    }
}
