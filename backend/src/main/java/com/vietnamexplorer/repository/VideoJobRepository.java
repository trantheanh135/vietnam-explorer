package com.vietnamexplorer.repository;

import com.vietnamexplorer.model.VideoJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface VideoJobRepository extends JpaRepository<VideoJob, Long> {

    long countByStartedAtAfter(Instant since);

    Optional<VideoJob> findFirstByPlaceIdAndStatusOrderByStartedAtDesc(String placeId, String status);

    List<VideoJob> findTop20ByOrderByStartedAtDesc();

    @Query("select coalesce(sum(j.cost), 0) from VideoJob j where j.status = 'ready'")
    double totalCost();
}
