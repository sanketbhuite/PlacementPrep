package com.example.PlacementPrep.controller;

import com.example.PlacementPrep.model.MockTestSetting;
import com.example.PlacementPrep.repository.MockTestSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.logging.Logger;
import java.util.logging.Level;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/mock-duration")
@CrossOrigin(origins = "http://localhost:5173")
public class MockTestSettingController {

    private final MockTestSettingRepository repo;
    private static final Logger LOGGER = Logger.getLogger(MockTestSettingController.class.getName());
    @Autowired
    public MockTestSettingController(MockTestSettingRepository repo) {
        this.repo = repo;
    }

 // Helper: get or create default setting
private MockTestSetting getOrCreate() {
    // Avoid using findTopByOrderByIdAsc() which generates dialect SQL incompatible with some Oracle setups.
    // Fetch all and pick the first row in Java (safe when table is tiny).
    try {
        return repo.findAll().stream().findFirst().orElseGet(() -> {
            MockTestSetting s = new MockTestSetting();
            s.setDurationMinutes(10); // default
            return repo.save(s);
        });
    } catch (Exception e) {
        // If repo.findAll() itself fails (rare), fall back to creating a new setting
        MockTestSetting s = new MockTestSetting();
        s.setDurationMinutes(10);
        return repo.save(s);
    }
}

    // GET: fetch current duration
    @GetMapping
    public Map<String, Object> getDuration() {
        MockTestSetting s = getOrCreate();
        int totalMinutes = s.getDurationMinutes();

        int hours = totalMinutes / 60;
        int minutes = totalMinutes % 60;

        Map<String, Object> resp = new HashMap<>();
        resp.put("durationMinutes", totalMinutes);
        resp.put("hours", hours);
        resp.put("minutes", minutes);

        return resp;
    }

@PostMapping
public ResponseEntity<?> updateDuration(@RequestBody Map<String, Object> body) {
    try {
        // Accept both {durationMinutes} OR {hours, minutes}
        Integer durationMinutes = null;

        Object dm = body.get("durationMinutes");
        if (dm != null) {
            if (dm instanceof Number) {
                durationMinutes = ((Number) dm).intValue();
            } else if (dm instanceof String) {
                try {
                    durationMinutes = Integer.parseInt(((String) dm).trim());
                } catch (NumberFormatException ignored) { /* will fallback below */ }
            }
        }

        if (durationMinutes == null) {
            // try hours/minutes
            int h = 0;
            int m = 0;
            Object ho = body.get("hours");
            Object mo = body.get("minutes");
            if (ho instanceof Number) h = ((Number) ho).intValue();
            else if (ho instanceof String) {
                try { h = Integer.parseInt(((String) ho).trim()); } catch (NumberFormatException ignored) {}
            }
            if (mo instanceof Number) m = ((Number) mo).intValue();
            else if (mo instanceof String) {
                try { m = Integer.parseInt(((String) mo).trim()); } catch (NumberFormatException ignored) {}
            }
            durationMinutes = h * 60 + m;
        }

        // ensure positive fallback
        if (durationMinutes == null || durationMinutes <= 0) {
            durationMinutes = 10;
        }

        MockTestSetting s = getOrCreate();
        s.setDurationMinutes(durationMinutes);
        repo.save(s);

        int hours = durationMinutes / 60;
        int minutes = durationMinutes % 60;

        Map<String, Object> resp = new HashMap<>();
        resp.put("durationMinutes", durationMinutes);
        resp.put("hours", hours);
        resp.put("minutes", minutes);

        return ResponseEntity.ok(resp);
    } catch (Exception e) {
        LOGGER.log(Level.SEVERE, "Failed to update mock test duration", e);
        Map<String, String> err = new HashMap<>();
        err.put("error", "Failed to update mock test duration.");
        err.put("detail", e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
    }
}
}