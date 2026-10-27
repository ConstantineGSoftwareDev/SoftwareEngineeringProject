package com.example.Openfest.dto;

import com.example.Openfest.entity.AgeRestriction;
import com.example.Openfest.entity.EventStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class UpdateEventRequest {

    @NotBlank(message = "Event title is required")
    @Size(max = 150, message = "Event title must not exceed 150 characters")
    private String title;

    private String description;

    @NotBlank(message = "Event location is required")
    private String location;

    @NotNull(message = "Capacity limit is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @NotNull(message = "Age restriction is required")
    private AgeRestriction ageRestriction;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.00", message = "Price cannot be negative")
    private BigDecimal price;

    private EventStatus status;

    public UpdateEventRequest() {
    }

    public UpdateEventRequest(String title, String description, String location,
                              Integer capacity, AgeRestriction ageRestriction,
                              BigDecimal price, EventStatus status) {
        this.title = title;
        this.description = description;
        this.location = location;
        this.capacity = capacity;
        this.ageRestriction = ageRestriction;
        this.price = price;
        this.status = status;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public AgeRestriction getAgeRestriction() {
        return ageRestriction;
    }

    public void setAgeRestriction(AgeRestriction ageRestriction) {
        this.ageRestriction = ageRestriction;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public EventStatus getStatus() {
        return status;
    }

    public void setStatus(EventStatus status) {
        this.status = status;
    }
}
