package com.example.PlacementPrep.controller;

import com.example.PlacementPrep.dto.ChatMessage;
import com.example.PlacementPrep.dto.Choice;
import com.example.PlacementPrep.dto.OpenAIResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequestMapping("/api/explain")
@CrossOrigin(origins = "http://localhost:5173")
public class ExplanationController {

    @Value("${openai.api.key}")
    private String openaiApiKey;

    private static final String OPENAI_URL = "https://openrouter.ai/api/v1/chat/completions";

    @PostMapping
    public ResponseEntity<Map<String, Object>> getExplanation(@RequestBody Map<String, String> payload) {
        try {
            String question = payload.get("question");
            String answer = payload.get("answer");

            String prompt = "Explain briefly and clearly in 60 words why the correct answer is '" +
                    answer + "' for the question: " + question;

            RestTemplate restTemplate = new RestTemplate();

            // Request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "gpt-3.5-turbo");

            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", "You are an AI tutor for technical MCQs."));
            messages.add(Map.of("role", "user", "content", prompt));

            requestBody.put("messages", messages);

            // Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openaiApiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // No raw map — parse directly into DTO
            ResponseEntity<OpenAIResponse> response =
                    restTemplate.postForEntity(OPENAI_URL, entity, OpenAIResponse.class);

            OpenAIResponse ai = response.getBody();

            if (ai != null && ai.getChoices() != null && !ai.getChoices().isEmpty()) {
                String explanation = ai.getChoices()
                        .get(0)
                        .getMessage()
                        .getContent();

                return ResponseEntity.ok(Map.of("explanation", explanation));
            }

            return ResponseEntity.status(500).body(Map.of("error", "Invalid AI response"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch explanation"));
        }
    }
}
