package com.example.PlacementPrep.repository;
import com.example.PlacementPrep.model.Subject;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SubjectRepository extends JpaRepository<Subject, Long> { 
    Optional<Subject> findById(Long id);

}
