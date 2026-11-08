
package com.example.Openfest.controller;

import com.example.Openfest.entity.Rsvp;
import com.example.Openfest.service.RsvpService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
public class RsvpController {

    private final RsvpService rsvpService;

    public RsvpController(RsvpService rsvpService) {
        this.rsvpService = rsvpService;
    }

    // Safe response without exposing user entities
    public record ReservationResponse(
            Long rsvpId,
            Long eventId,
            String eventTitle,
            String attendeeEmail,
            LocalDateTime createdAt
    ) {}

    private ReservationResponse toResponse(Rsvp rsvp) {
        return new ReservationResponse(
                rsvp.getId(),
                rsvp.getEvent().getId(),
                rsvp.getEvent().getTitle(),
                rsvp.getUser().getEmail(),
                rsvp.getCreatedAt()
        );
    }

    // Create a free event RSVP
    @PostMapping("/{eventId}/rsvp")
    public ResponseEntity<Map<String, Object>> reserveSpot(
            @PathVariable Long eventId,
            Authentication authentication) {

        String email = authentication == null
                ? null
                : authentication.getName();

        Rsvp rsvp = rsvpService.reserveSpot(eventId, email);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of(
                        "message", "RSVP successful",
                        "rsvpId", rsvp.getId(),
                        "eventId", eventId
                )
        );
    }

    // Attendee: view their own reservations
    @GetMapping("/my-rsvps")
    public List<ReservationResponse> getMyReservations(
            Authentication authentication) {

        String email = authentication == null
                ? null
                : authentication.getName();

        return rsvpService.getMyReservations(email)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Creator: view reservations for their event
    @GetMapping("/{eventId}/rsvps")
    public List<ReservationResponse> getEventReservations(
            @PathVariable Long eventId,
            Authentication authentication) {

        String email = authentication == null
                ? null
                : authentication.getName();

        return rsvpService.getEventReservations(eventId, email)
                .stream()
                .map(this::toResponse)
                .toList();
    }
}
