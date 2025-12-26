package com.example.PlacementPrep.service;

import com.example.PlacementPrep.model.Score;
import com.example.PlacementPrep.repository.ScoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ScoreService {

    @Autowired
    private ScoreRepository scoreRepository;

    /**
     * Save a score for a user.
     * rawScore is expected as 0–100 (percentage from frontend).
     */
    public Score saveScore(Long userId, Double rawScore, String testType) {
        int scoreValue = rawScore == null ? 0 : (int) Math.round(rawScore);

        Score score = new Score();
        score.setUserId(userId);
        score.setScore(scoreValue);
        score.setTestType(testType);
        score.setCreatedAt(LocalDateTime.now());

        return scoreRepository.save(score);
    }

    /**
     * Get all scores for a user, ordered oldest → newest.
     */
    public List<Score> getScoresByUser(Long userId) {
        return scoreRepository.findByUserIdOrderByCreatedAtAsc(userId);
    }

    /**
     * Get the latest score for a given user + test type.
     * We avoid "Top" keywords to not trigger Oracle FETCH FIRST.
     */
    public Score getLatestScoreForUserAndTest(Long userId, String testType) {
        List<Score> list = scoreRepository.findByUserIdAndTestTypeOrderByCreatedAtDesc(userId, testType);
        return list.isEmpty() ? null : list.get(0);
    }
// ===============================
// DASHBOARD ANALYTICS SUMMARY
// ===============================
public Map<String, Object> getUserScoreSummary(Long userId) {
    List<Score> scores = scoreRepository.findByUserIdOrderByCreatedAtAsc(userId);

    Map<String, Object> summary = new HashMap<>();
    if (scores.isEmpty()) {
        summary.put("totalAttempts", 0);
        summary.put("averageScore", 0);
        summary.put("bestScore", 0);
        summary.put("latestScore", 0);
        return summary;
    }

    int totalAttempts = scores.size();
    double avgScore = scores.stream().mapToDouble(Score::getScore).average().orElse(0);
    int bestScore = scores.stream().mapToInt(Score::getScore).max().orElse(0);
    int latestScore = scores.get(0).getScore();

    summary.put("totalAttempts", totalAttempts);
    summary.put("averageScore", Math.round(avgScore));
    summary.put("bestScore", bestScore);
    summary.put("latestScore", latestScore);
    summary.put("lastUpdated", scores.get(0).getCreatedAt());

    return summary;
}


}
