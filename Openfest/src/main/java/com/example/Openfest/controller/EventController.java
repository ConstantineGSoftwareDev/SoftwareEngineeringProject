package com.example.Openfest.controller;

import com.example.Openfest.dto.CreateEventRequest;
import com.example.Openfest.dto.EventResponse;
import com.example.Openfest.service.EventService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping
    public ResponseEntity<EventResponse> createEvent(
            @Valid @RequestBody CreateEventRequest request,
            Authentication authentication) {

        // TODO: Remove the null check once authentication is implemented and the user is guaranteed to be authenticated.
        String authenticatedEmail = authentication != null ? authentication.getName() : null;
        EventResponse response = eventService.createEvent(request, authenticatedEmail);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
