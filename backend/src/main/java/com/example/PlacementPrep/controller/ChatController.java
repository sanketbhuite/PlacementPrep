package com.example.PlacementPrep.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * Simple synchronous Chat endpoint that forwards to OpenRouter (OpenAI-compatible).
 *
 * Request:  POST /api/chat/ask   { "question": "..." }
 * Response: 200 { "answer": "..." }  or 500 { "error": "...", "detail": "..." }
 */
@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {

    @Value("${openai.api.key}")
    private String openaiApiKey;

    // Use the base OpenRouter / OpenAI-compatible endpoint
    private static final String OPENAI_URL = "https://openrouter.ai/api/v1/chat/completions";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public ChatController() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    @PostMapping("/ask")
    public ResponseEntity<Map<String, Object>> ask(@RequestBody Map<String, String> req) {
        try {
            String question = req == null ? null : req.get("question");
            if (question == null || question.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Question is required."));
            }

            // small system prompt to keep answers short and on-topic
            String systemPrompt = "You are a helpful assistant that gives short, clear answers for coding and computer-science learning. " +
                    "Prefer concise explanations and a short example if applicable. Keep the reply to 2-6 sentences where possible.";

            Map<String, Object> body = new HashMap<>();
            body.put("model", "gpt-3.5-turbo"); // change if you want gpt-4 / different model
            body.put("max_tokens", 300);
            body.put("temperature", 0.2);

            // messages array
            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", systemPrompt));
            messages.add(Map.of("role", "user", "content", question));
            body.put("messages", messages);

            // headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openaiApiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<String> resp = restTemplate.postForEntity(OPENAI_URL, entity, String.class);

            if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) {
                String detail = resp.getBody() != null ? resp.getBody() : "Empty body";
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "LLM returned non-2xx", "detail", detail));
            }

            // parse JSON response safely
            JsonNode root = objectMapper.readTree(resp.getBody());
            JsonNode choices = root.path("choices");
            if (choices.isArray() && choices.size() > 0) {
                JsonNode first = choices.get(0);

                // chat completion style: message.content
                String content = null;
                if (first.has("message") && first.get("message").has("content")) {
                    content = first.get("message").get("content").asText(null);
                } else if (first.has("text")) {
                    // fallback older style
                    content = first.get("text").asText(null);
                }

                if (content != null) {
                    return ResponseEntity.ok(Map.of("answer", content.trim()));
                } else {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(Map.of("error", "Unexpected LLM response shape", "detail", root.toString()));
                }
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "No choices returned by LLM", "detail", root.toString()));
            }

        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to call LLM", "detail", ex.getMessage()));
        }
    }
}
