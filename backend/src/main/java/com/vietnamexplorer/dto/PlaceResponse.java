package com.vietnamexplorer.dto;

import com.vietnamexplorer.model.Place;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;

public record PlaceResponse(
        String id,
        String category,
        String region,
        String nameEn,
        String nameVi,
        String venue,
        String address,
        String area,
        double lat,
        double lng,
        List<String> tags,
        String descEn,
        String descVi,
        String tipEn,
        String tipVi,
        Double rating,
        String price,
        ImageDto image,
        boolean published,
        Instant createdAt,
        Instant updatedAt
) {
    public static PlaceResponse from(Place p) {
        List<String> tags = p.getTags() == null || p.getTags().isBlank()
                ? List.of()
                : Arrays.asList(p.getTags().split(","));
        ImageDto image = p.getImageSrc() == null
                ? null
                : new ImageDto(p.getImageSrc(), p.getImagePage(), p.getImageAuthor(), p.getImageLicense());
        return new PlaceResponse(p.getId(), p.getCategory(), p.getRegion(), p.getNameEn(), p.getNameVi(),
                p.getVenue(), p.getAddress(), p.getArea(), p.getLat(), p.getLng(), tags,
                p.getDescEn(), p.getDescVi(), p.getTipEn(), p.getTipVi(), p.getRating(), p.getPrice(),
                image, p.isPublished(), p.getCreatedAt(), p.getUpdatedAt());
    }
}
