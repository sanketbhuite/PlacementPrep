package com.example.PlacementPrep.service;

import com.example.PlacementPrep.model.User;
import com.example.PlacementPrep.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public User signup(User user) {
        // ✅ Check if email already exists
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        // ✅ Hash password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("STUDENT");
        return userRepository.save(user);
    }

    public User login(String email, String password) {
        // ✅ Use Optional safely
        User existingUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(password, existingUser.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        return existingUser;
    }
}
