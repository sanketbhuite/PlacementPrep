package com.example.PlacementPrep.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "MOCK_TEST_SETTINGS")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MockTestSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Store duration in minutes (single integer)
    @Column(name = "DURATION_MINUTES", nullable = false)
    private Integer durationMinutes;
}
