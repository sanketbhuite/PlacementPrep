package com.example.PlacementPrep.controller;

import com.example.PlacementPrep.model.Question;
import com.example.PlacementPrep.repository.QuestionRepository;
import com.example.PlacementPrep.repository.SubjectRepository;
import com.example.PlacementPrep.model.Subject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = "http://localhost:5173")
public class QuestionController {

    private final QuestionRepository questionRepository;
    private final SubjectRepository subjectRepository;

    @Autowired
    public QuestionController(QuestionRepository questionRepository, SubjectRepository subjectRepository) {
        this.questionRepository = questionRepository;
        this.subjectRepository = subjectRepository;
    }

    // Get all questions (with subject)
    @GetMapping
    public List<Question> getAllQuestions() {
        return questionRepository.findAllWithSubject();
    }

    // Get by ID
    @GetMapping("/{id}")
    public Optional<Question> getQuestionById(@PathVariable Long id) {
        return questionRepository.findById(id);
    }

    // Get by subject ID
    @GetMapping("/subject/{subjectId}")
    public List<Question> getQuestionsBySubjectId(@PathVariable Long subjectId) {
        return questionRepository.findBySubject_Id(subjectId);
    }

    // Get by subject NAME (filter manually)
    @GetMapping("/subject/name/{name}")
    public List<Question> getQuestionsBySubjectName(@PathVariable String name) {
        return questionRepository.findAll().stream()
                .filter(q -> q.getSubject() != null && q.getSubject().getName().equalsIgnoreCase(name))
                .toList();
    }

    // Search
    @GetMapping("/search/{keyword}")
    public List<Question> searchQuestions(@PathVariable String keyword) {
        return questionRepository.findByQuestionTextContainingIgnoreCase(keyword);
    }

    // Delete
    @DeleteMapping("/{id}")
    public void deleteQuestion(@PathVariable Long id) {
        questionRepository.deleteById(id);
    }

    // Add
    @PostMapping
    public Question addQuestion(@RequestBody Map<String, Object> body) {
        String questionText = (String) body.get("questionText");
        String optionsJson  = (String) body.get("optionsJson");
        String correctAnswer = (String) body.get("correctAnswer");
        Number subjectIdNum = (Number) body.get("subjectId");
        Long subjectId = subjectIdNum != null ? subjectIdNum.longValue() : null;

        Question q = new Question();
        q.setQuestionText(questionText);
        q.setOptionsJson(optionsJson);
        q.setCorrectAnswer(correctAnswer);
        q.setCreatedAt(new java.sql.Timestamp(System.currentTimeMillis()));

        if (subjectId != null) {
            Subject s = subjectRepository.findById(subjectId).orElse(null);
            q.setSubject(s);
        }

        return questionRepository.save(q);
    }

    // Update
    @PutMapping("/{id}")
    public Question updateQuestion(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body
    ) {
        Question q = questionRepository.findById(id).orElse(null);
        if (q == null) return null;

        String questionText = (String) body.get("questionText");
        String optionsJson  = (String) body.get("optionsJson");
        String correctAnswer = (String) body.get("correctAnswer");
        Number subjectIdNum = (Number) body.get("subjectId");

        if (questionText != null) q.setQuestionText(questionText);
        if (optionsJson != null) q.setOptionsJson(optionsJson);
        if (correctAnswer != null) q.setCorrectAnswer(correctAnswer);

        if (subjectIdNum != null) {
            Long subjectId = subjectIdNum.longValue();
            Subject s = subjectRepository.findById(subjectId).orElse(null);
            q.setSubject(s);
        }

        return questionRepository.save(q);
    }
}
