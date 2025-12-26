package com.example.PlacementPrep.controller;

import com.example.PlacementPrep.model.Score;
import com.example.PlacementPrep.service.ScoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/scores")
@CrossOrigin(origins = "http://localhost:5173")
public class ScoreController {

    @Autowired
    private ScoreService scoreService;

    // POST /api/scores
    @PostMapping
    public Score create(@RequestBody ScoreRequest request) {
        String type = request.getTestType();
        if (type == null || type.isBlank()) {
            type = "Mock Test";
        }
        return scoreService.saveScore(request.getUserId(), request.getScore(), type);
    }

    // GET /api/scores/user/{userId}
    @GetMapping("/user/{userId}")
    public List<Score> getScoresForUser(@PathVariable Long userId) {
        return scoreService.getScoresByUser(userId);
    }

    // --------- DTO for incoming JSON ----------
    static class ScoreRequest {
        private Long userId;
        private Double score;
        private String testType;

        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public Double getScore() {
            return score;
        }

        public void setScore(Double score) {
            this.score = score;
        }

        public String getTestType() {
            return testType;
        }

        public void setTestType(String testType) {
            this.testType = testType;
        }
    }

    // ===============================
// USER SCORE SUMMARY ENDPOINT
// ===============================
@GetMapping("/summary/{userId}")
public ResponseEntity<Map<String, Object>> getUserScoreSummary(@PathVariable Long userId) {
    Map<String, Object> summary = scoreService.getUserScoreSummary(userId);
    return ResponseEntity.ok(summary);
}

}
