package com.vietnamexplorer.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

/** Body for creating/updating a place; the same shape is used for the seed file. */
public record PlaceRequest(
        @Pattern(regexp = "[a-z0-9-]{3,80}", message = "chỉ gồm chữ thường, số và dấu gạch ngang (3–80 ký tự)")
        String id,

        @NotBlank @Pattern(regexp = "travel|food", message = "phải là travel hoặc food")
        String category,

        @NotBlank @Pattern(regexp = "north|central|south", message = "phải là north, central hoặc south")
        String region,

        @NotBlank @Size(max = 160) String nameEn,
        @NotBlank @Size(max = 160) String nameVi,
        @Size(max = 160) String venue,
        @Size(max = 300) String address,
        @NotBlank @Size(max = 120) String area,

        @NotNull(message = "chưa chọn vị trí trên bản đồ")
        @DecimalMin(value = "8.0", message = "vị trí phải nằm trong Việt Nam")
        @DecimalMax(value = "23.5", message = "vị trí phải nằm trong Việt Nam") Double lat,
        @NotNull(message = "chưa chọn vị trí trên bản đồ")
        @DecimalMin(value = "102.0", message = "vị trí phải nằm trong Việt Nam")
        @DecimalMax(value = "110.0", message = "vị trí phải nằm trong Việt Nam") Double lng,

        List<@Pattern(regexp = "nature|beach|mountain|heritage|city") String> tags,

        @NotBlank @Size(max = 3000) String descEn,
        @NotBlank @Size(max = 3000) String descVi,
        @Size(max = 400) String tipEn,
        @Size(max = 400) String tipVi,

        @DecimalMin("1.0") @DecimalMax("5.0") Double rating,
        @Size(max = 60) String price,

        @Valid ImageDto image,

        /** An uploaded video in our Blob store, or a YouTube link. Null/blank removes it. */
        @Size(max = 600) String videoUrl,
        /** An uploaded GIF / animated WebP in our Blob store. Null/blank removes it. */
        @Size(max = 600) String animatedUrl,
        Boolean published
) {
}
