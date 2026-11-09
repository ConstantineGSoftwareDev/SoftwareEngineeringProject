
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
import java.util.List;

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

    private User requireUser(String email) {
        if (email == null || email.isBlank()
                || "anonymousUser".equalsIgnoreCase(email)) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Please log in");
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "User not found"));
    }

    // Reserve a spot at a free event
    @Transactional
    public Rsvp reserveSpot(Long eventId, String email) {

        User attendee = requireUser(email);

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

    // Attendee: view their own reservations
    @Transactional(readOnly = true)
    public List<Rsvp> getMyReservations(String email) {
        User attendee = requireUser(email);
        return rsvpRepository.findByUserId(attendee.getId());
    }

    // Creator: view reservations for their own event
    @Transactional(readOnly = true)
    public List<Rsvp> getEventReservations(Long eventId, String email) {
        User currentUser = requireUser(email);

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Event not found"));

        if (event.getCreator() == null
                || !event.getCreator().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only the event creator can view attendees");
        }

        return rsvpRepository.findByEventId(eventId);
    }
}
