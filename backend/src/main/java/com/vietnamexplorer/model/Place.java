package com.vietnamexplorer.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

/**
 * A travel destination (category "travel") or a food review (category "food").
 * Food reviews use nameEn/nameVi for the dish and venue/address for the place serving it.
 */
@Entity
@Table(name = "place")
@Getter
@Setter
public class Place {

    @Id
    @Column(length = 80)
    private String id;

    @Column(nullable = false, length = 10)
    private String category;

    @Column(nullable = false, length = 10)
    private String region;

    @Column(nullable = false, length = 160)
    private String nameEn;

    @Column(nullable = false, length = 160)
    private String nameVi;

    @Column(length = 160)
    private String venue;

    @Column(length = 300)
    private String address;

    @Column(nullable = false, length = 120)
    private String area;

    private double lat;

    private double lng;

    /** Comma-separated travel tags, e.g. "nature,beach". */
    @Column(length = 200)
    private String tags;

    @Column(nullable = false, length = 3000)
    private String descEn;

    @Column(nullable = false, length = 3000)
    private String descVi;

    /** Travel: best time to visit. Food: what to order. */
    @Column(length = 400)
    private String tipEn;

    @Column(length = 400)
    private String tipVi;

    private Double rating;

    @Column(length = 60)
    private String price;

    /** Either an absolute https URL or "uploads/<file>" served by this API. */
    @Column(length = 600)
    private String imageSrc;

    @Column(length = 600)
    private String imagePage;

    @Column(length = 200)
    private String imageAuthor;

    @Column(length = 80)
    private String imageLicense;

    /** AI video (Vercel Blob URL) and the state of its generation: none | generating | ready | failed. */
    @Column(length = 600)
    private String videoUrl;

    @Column(length = 12)
    private String videoStatus;

    @Column(length = 400)
    private String videoError;

    @Column(length = 300)
    private String videoOperation;

    @Column(length = 80)
    private String videoModel;

    private Instant videoStartedAt;

    /** Credit for a video made by someone else (e.g. a Wikimedia Commons clip). */
    @Column(length = 600)
    private String videoPage;

    @Column(length = 200)
    private String videoAuthor;

    @Column(length = 80)
    private String videoLicense;

    /** Animated image (GIF / animated WebP) in our Blob store, shown in the cover. */
    @Column(length = 600)
    private String animatedUrl;

    private boolean published = true;

    private int sortOrder;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
