package com.example.PlacementPrep.repository;

import com.example.PlacementPrep.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    // ✔ Correct: find by subject entity ID
    List<Question> findBySubject_Id(Long subjectId);

    // ✔ Search
    List<Question> findByQuestionTextContainingIgnoreCase(String keyword);

    // ✔ Always fetch subject to avoid "Other"
    @Query("SELECT q FROM Question q LEFT JOIN FETCH q.subject")
    List<Question> findAllWithSubject();
}
