package com.example.PlacementPrep.controller;

import com.example.PlacementPrep.model.User;
import com.example.PlacementPrep.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final UserRepository userRepository;

    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ✅ Fetch all registered users
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // ✅ Dummy announcements endpoint (replace later)
    @GetMapping("/announcements")
    public List<String> getAnnouncements() {
        return List.of(
            "Mock Test on 15 Nov 2025",
            "Campus Drive registrations open!",
            "System Design session tomorrow"
        );
    }
}
