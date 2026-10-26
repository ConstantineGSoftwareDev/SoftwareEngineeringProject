package com.example.Openfest.dto;

import com.example.Openfest.entity.AgeRestriction;
import com.example.Openfest.entity.Event;
import com.example.Openfest.entity.EventStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class EventResponse {

    private Long id;
    private Long creatorId;
    private String creatorEmail;
    private String title;
    private String description;
    private String location;
    private Integer capacity;
    private AgeRestriction ageRestriction;
    private BigDecimal price;
    private EventStatus status;
    private LocalDateTime createdAt;

    public EventResponse() {
    }

    public static EventResponse fromEntity(Event event) {
        EventResponse response = new EventResponse();
        response.id = event.getId();
        if (event.getCreator() != null) {
            response.creatorId = event.getCreator().getId();
            response.creatorEmail = event.getCreator().getEmail();
        }
        response.title = event.getTitle();
        response.description = event.getDescription();
        response.location = event.getLocation();
        response.capacity = event.getCapacity();
        response.ageRestriction = event.getAgeRestriction();
        response.price = event.getPrice();
        response.status = event.getStatus();
        response.createdAt = event.getCreatedAt();
        return response;
    }

    public Long getId() {
        return id;
    }

    public Long getCreatorId() {
        return creatorId;
    }

    public String getCreatorEmail() {
        return creatorEmail;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getLocation() {
        return location;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public AgeRestriction getAgeRestriction() {
        return ageRestriction;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public EventStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
