package com.example.Openfest.controller;

import com.example.Openfest.dto.CreateEventRequest;
import com.example.Openfest.dto.EventResponse;
import com.example.Openfest.dto.UpdateEventRequest;
import com.example.Openfest.dto.UpdateEventStatusRequest;
import com.example.Openfest.service.EventService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

        String authenticatedEmail = authentication != null ? authentication.getName() : null;
        EventResponse response = eventService.createEvent(request, authenticatedEmail);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/creator")
    public ResponseEntity<List<EventResponse>> getCreatorEvents(Authentication authentication) {
        String authenticatedEmail = authentication != null ? authentication.getName() : null;
        List<EventResponse> events = eventService.getEventsByCreator(authenticatedEmail);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventResponse> getEventById(@PathVariable Long id) {
        EventResponse event = eventService.getEventById(id);
        return ResponseEntity.ok(event);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventResponse> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody UpdateEventRequest request,
            Authentication authentication) {

        String authenticatedEmail = authentication != null ? authentication.getName() : null;
        EventResponse updated = eventService.updateEvent(id, request, authenticatedEmail);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<EventResponse> updateEventStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateEventStatusRequest request,
            Authentication authentication) {

        String authenticatedEmail = authentication != null ? authentication.getName() : null;
        EventResponse updated = eventService.updateEventStatus(id, request.getStatus(), authenticatedEmail);
        return ResponseEntity.ok(updated);
    }
}
