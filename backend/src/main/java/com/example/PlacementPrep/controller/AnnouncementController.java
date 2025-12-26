package com.example.PlacementPrep.controller;

import com.example.PlacementPrep.model.Announcement;
import com.example.PlacementPrep.service.AnnouncementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/announcements")
@CrossOrigin(origins = "http://localhost:5173")
public class AnnouncementController {

    @Autowired
    private AnnouncementService service;

    @GetMapping
    public List<Announcement> getAll() {
        return service.getAll();
    }

    @PostMapping
    public Announcement create(@RequestBody Announcement a) {
        return service.add(a);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
