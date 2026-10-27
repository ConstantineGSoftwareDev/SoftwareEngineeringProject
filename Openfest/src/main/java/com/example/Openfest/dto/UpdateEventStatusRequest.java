package com.example.Openfest.dto;

import com.example.Openfest.entity.EventStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateEventStatusRequest {

    @NotNull(message = "Status is required")
    private EventStatus status;

    public UpdateEventStatusRequest() {
    }

    public UpdateEventStatusRequest(EventStatus status) {
        this.status = status;
    }

    public EventStatus getStatus() {
        return status;
    }

    public void setStatus(EventStatus status) {
        this.status = status;
    }
}
