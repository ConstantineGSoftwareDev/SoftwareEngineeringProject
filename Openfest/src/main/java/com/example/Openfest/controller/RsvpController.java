
package com.example.Openfest.controller;

import com.example.Openfest.entity.Rsvp;
import com.example.Openfest.service.RsvpService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/events")
public class RsvpController {

    private final RsvpService rsvpService;

    public RsvpController(RsvpService rsvpService) {
        this.rsvpService = rsvpService;
    }

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
}
