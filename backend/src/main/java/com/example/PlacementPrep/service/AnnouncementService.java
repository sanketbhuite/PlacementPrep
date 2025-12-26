package com.example.PlacementPrep.service;

import com.example.PlacementPrep.model.Announcement;
import com.example.PlacementPrep.repository.AnnouncementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AnnouncementService {

    @Autowired
    private AnnouncementRepository repo;

    public List<Announcement> getAll() {
        return repo.findAll();
    }

    public Announcement add(Announcement a) {
        return repo.save(a);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
