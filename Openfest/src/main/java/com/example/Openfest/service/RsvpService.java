
package com.example.Openfest.service;

import com.example.Openfest.entity.Event;
import com.example.Openfest.entity.EventStatus;
import com.example.Openfest.entity.Rsvp;
import com.example.Openfest.entity.User;
import com.example.Openfest.repository.EventRepository;
import com.example.Openfest.repository.RsvpRepository;
import com.example.Openfest.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;

@Service
public class RsvpService {

    private final RsvpRepository rsvpRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public RsvpService(
            RsvpRepository rsvpRepository,
            EventRepository eventRepository,
            UserRepository userRepository) {
        this.rsvpRepository = rsvpRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Rsvp reserveSpot(Long eventId, String email) {

        if (email == null || email.isBlank()
                || "anonymousUser".equalsIgnoreCase(email)) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Please log in to RSVP");
        }

        User attendee = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "User not found"));

        Event event = eventRepository.findByIdForUpdate(eventId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Event not found"));

        if (event.getStatus() != EventStatus.PUBLISHED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This event is not open for RSVP");
        }

        if (event.getPrice() == null
                || event.getPrice().compareTo(BigDecimal.ZERO) != 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "RSVP is only available for free events");
        }

        if (rsvpRepository.existsByEventIdAndUserId(
                eventId, attendee.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "You have already RSVP'd to this event");
        }

        long reserved = rsvpRepository.countByEventId(eventId);

        if (event.getCapacity() == null
                || reserved >= event.getCapacity()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Event is full");
        }

        return rsvpRepository.save(new Rsvp(event, attendee));
    }
}
