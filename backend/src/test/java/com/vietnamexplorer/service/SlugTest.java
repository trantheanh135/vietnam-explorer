package com.vietnamexplorer.service;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SlugTest {

    @Test
    void makesUrlFriendlyIdsFromVietnameseNames() {
        assertThat(PlaceService.slugify("Phở Đà Lạt")).isEqualTo("pho-da-lat");
        assertThat(PlaceService.slugify("  Bánh mì — Hội An!! ")).isEqualTo("banh-mi-hoi-an");
        assertThat(PlaceService.slugify("Ốc")).isEqualTo("place-oc");
    }

    @Test
    void detectsImageTypesFromBytes() {
        assertThat(UploadService.detectExtension(new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0, 0, 0, 0, 0, 0, 0, 0, 0})).isEqualTo("jpg");
        assertThat(UploadService.detectExtension("RIFF0000WEBP".getBytes())).isEqualTo("webp");
        assertThat(UploadService.detectExtension("<html>hello!".getBytes())).isNull();
    }
}
