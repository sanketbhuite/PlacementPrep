package com.example.PlacementPrep.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ANNOUNCEMENTS")
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "TITLE", nullable = false)
    private String title;

    @Lob
    @Column(name = "MESSAGE", nullable = false)
    private String message;

    @Column(name = "ANNOUNCEMENT_DATE")
    private LocalDateTime announcementDate;

    @PrePersist
    protected void onCreate() {
        this.announcementDate = LocalDateTime.now();
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getAnnouncementDate() { return announcementDate; }
    public void setAnnouncementDate(LocalDateTime announcementDate) { this.announcementDate = announcementDate; }
}
