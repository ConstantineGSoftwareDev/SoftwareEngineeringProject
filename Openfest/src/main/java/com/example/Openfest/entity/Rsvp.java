
package com.example.Openfest.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "rsvps",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"event_id", "user_id"}
    )
)
public class Rsvp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    protected Rsvp() {
        // Required by JPA
    }

    public Rsvp(Event event, User user) {
        this.event = event;
        this.user = user;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Event getEvent() {
        return event;
    }

    public User getUser() {
        return user;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
