package com.example.PlacementPrep.controller;

import com.example.PlacementPrep.model.Subject;
import com.example.PlacementPrep.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/subjects")
@CrossOrigin(origins = "http://localhost:5173") // frontend React URL
public class SubjectController {

    private final SubjectRepository subjectRepository;

    @Autowired
    public SubjectController(SubjectRepository subjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    // ✅ 1. Get all subjects (used in Practice.jsx tiles)
    @GetMapping
    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    // ✅ 2. Get one subject by ID
    @GetMapping("/{id}")
    public Optional<Subject> getSubjectById(@PathVariable Long id) {
        return subjectRepository.findById(id);
    }

    // ❌ REMOVED — was incorrect & unused
    // @GetMapping("/name/{name}")

    // ✅ 3. Add new subject (for Admin)
    @PostMapping
    public Subject addSubject(@RequestBody Subject subject) {
        return subjectRepository.save(subject);
    }

    // ✅ 4. Delete subject by ID (optional)
    @DeleteMapping("/{id}")
    public void deleteSubject(@PathVariable Long id) {
        subjectRepository.deleteById(id);
    }
}
