package com.example.PlacementPrep.repository;

import com.example.PlacementPrep.model.Score;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScoreRepository extends JpaRepository<Score, Long> {

    List<Score> findByUserIdOrderByCreatedAtAsc(Long userId);
    List<Score> findByUserIdAndTestTypeOrderByCreatedAtDesc(Long userId, String testType);
}
