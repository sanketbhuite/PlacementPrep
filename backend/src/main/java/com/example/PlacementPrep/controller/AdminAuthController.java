package com.example.PlacementPrep.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminAuthController {

    @Value("${admin.password}")
    private String adminPassword;

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> body) {
        String pwd = body.getOrDefault("password", "");
        boolean ok = constantTimeEquals(pwd, adminPassword);
        if (ok) {
            // super simple token; swap with JWT later
            String token = "admin-token-" + System.currentTimeMillis();
            return Map.of("ok", true, "token", token);
        }
        return Map.of("ok", false);
    }

    @PostMapping("/logout")
    public Map<String, Object> logout() {
        return Map.of("ok", true);
    }

    private boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null) return false;
        if (a.length() != b.length()) return false;
        int result = 0;
        for (int i = 0; i < a.length(); i++) result |= a.charAt(i) ^ b.charAt(i);
        return result == 0;
    }
}
