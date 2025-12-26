package com.example.PlacementPrep.repository;

import com.example.PlacementPrep.model.MockTestSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MockTestSettingRepository extends JpaRepository<MockTestSetting, Long> {

    // Always use the first (and only) row
    Optional<MockTestSetting> findTopByOrderByIdAsc();
}
