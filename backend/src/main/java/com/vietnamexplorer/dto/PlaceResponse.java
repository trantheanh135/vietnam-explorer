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
        VideoDto video,
        boolean published,
        Instant createdAt,
        Instant updatedAt
) {
    /** url is set once a video exists; status/error describe the latest generation (admin only). */
    public record VideoDto(String url, String status, String error, String model, Instant startedAt) {
    }

    /** Public view: only a finished video, no generation details. */
    public static PlaceResponse publicView(Place p) {
        PlaceResponse r = from(p);
        VideoDto v = p.getVideoUrl() == null ? null : new VideoDto(p.getVideoUrl(), "ready", null, p.getVideoModel(), null);
        return new PlaceResponse(r.id, r.category, r.region, r.nameEn, r.nameVi, r.venue, r.address, r.area, r.lat, r.lng,
                r.tags, r.descEn, r.descVi, r.tipEn, r.tipVi, r.rating, r.price, r.image, v, r.published, r.createdAt, r.updatedAt);
    }

    public static PlaceResponse from(Place p) {
        List<String> tags = p.getTags() == null || p.getTags().isBlank()
                ? List.of()
                : Arrays.asList(p.getTags().split(","));
        ImageDto image = p.getImageSrc() == null
                ? null
                : new ImageDto(p.getImageSrc(), p.getImagePage(), p.getImageAuthor(), p.getImageLicense());
        VideoDto video = p.getVideoUrl() == null && p.getVideoStatus() == null
                ? null
                : new VideoDto(p.getVideoUrl(), p.getVideoStatus(), p.getVideoError(), p.getVideoModel(), p.getVideoStartedAt());
        return new PlaceResponse(p.getId(), p.getCategory(), p.getRegion(), p.getNameEn(), p.getNameVi(),
                p.getVenue(), p.getAddress(), p.getArea(), p.getLat(), p.getLng(), tags,
                p.getDescEn(), p.getDescVi(), p.getTipEn(), p.getTipVi(), p.getRating(), p.getPrice(),
                image, video, p.isPublished(), p.getCreatedAt(), p.getUpdatedAt());
    }
}
