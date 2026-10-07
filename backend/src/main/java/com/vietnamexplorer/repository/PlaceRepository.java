package com.vietnamexplorer.repository;

import com.vietnamexplorer.model.Place;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PlaceRepository extends JpaRepository<Place, String> {

    List<Place> findAllByOrderBySortOrderAscCreatedAtAsc();

    List<Place> findByPublishedTrueOrderBySortOrderAscCreatedAtAsc();

    List<Place> findByCategoryOrderBySortOrderAscCreatedAtAsc(String category);

    List<Place> findByCategoryAndPublishedTrueOrderBySortOrderAscCreatedAtAsc(String category);

    long countByImageSrc(String imageSrc);

    List<Place> findByVideoStatus(String videoStatus);

    @Query("select coalesce(max(p.sortOrder), 0) from Place p")
    int maxSortOrder();
}
