package com.example.PlacementPrep.model;

import jakarta.persistence.*;
import lombok.*;
import java.sql.Timestamp;

@Entity
@Table(name = "QUESTIONS")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "QUESTION_TEXT", nullable = false, columnDefinition = "CLOB")
    private String questionText;

    @Column(name = "OPTIONS_JSON", nullable = false, columnDefinition = "CLOB")
    private String optionsJson;

    @Column(name = "CORRECT_ANSWER", nullable = false)
    private String correctAnswer;

    @Column(name = "CREATED_AT")
    private Timestamp createdAt;

    // REMOVE THIS — ❌ it breaks mapping
    // @Column(name = "SUBJECT")
    // private String subject;

    // ✔️ Correct Subject mapping
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SUBJECT_ID", referencedColumnName = "ID")
    private Subject subject;
}
