package com.vietnamexplorer.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

/** One AI video generation attempt: used for the daily limit and to show what has been spent. */
@Entity
@Table(name = "video_job")
@Getter
@Setter
public class VideoJob {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String placeId;

    @Column(nullable = false, length = 80)
    private String model;

    @Column(nullable = false, length = 12)
    private String status;

    /** Estimated cost in USD; Google only charges for videos that were generated successfully. */
    private double cost;

    @Column(length = 1000)
    private String prompt;

    @Column(length = 400)
    private String error;

    @Column(nullable = false)
    private Instant startedAt;

    private Instant finishedAt;
}
