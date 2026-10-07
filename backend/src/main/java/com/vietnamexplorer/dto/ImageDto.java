package com.vietnamexplorer.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** A photo: an https URL (e.g. Wikimedia) or "uploads/<file>" stored by this API, with credit. */
public record ImageDto(
        @Size(max = 600)
        @Pattern(regexp = "(https://\\S+|uploads/[a-f0-9-]+\\.(jpg|png|webp))",
                message = "phải là liên kết https hoặc ảnh đã tải lên")
        String src,
        @Size(max = 600) String page,
        @Size(max = 200) String author,
        @Size(max = 80) String license
) {
}
