package com.example.Openfest.service;

import com.example.Openfest.dto.CreateEventRequest;
import com.example.Openfest.dto.EventResponse;
import com.example.Openfest.dto.UpdateEventRequest;
import com.example.Openfest.entity.Event;
import com.example.Openfest.entity.EventStatus;
import com.example.Openfest.entity.User;
import com.example.Openfest.repository.EventRepository;
import com.example.Openfest.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public EventService(EventRepository eventRepository,
                        UserRepository userRepository,
                        PasswordEncoder passwordEncoder) {
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public EventResponse createEvent(CreateEventRequest request, String authenticatedEmail) {
        User creator = resolveCreator(authenticatedEmail);

        // Ensure status is either DRAFT or PUBLISHED
        EventStatus status = request.getStatus();
        if (status == null || (status != EventStatus.DRAFT && status != EventStatus.PUBLISHED)) {
            status = EventStatus.DRAFT;
        }

        Event event = new Event(
                creator,
                request.getTitle().trim(),
                request.getDescription() != null ? request.getDescription().trim() : null,
                request.getLocation().trim(),
                request.getCapacity(),
                request.getAgeRestriction(),
                request.getPrice(),
                status
        );

        Event savedEvent = eventRepository.save(event);
        return EventResponse.fromEntity(savedEvent);
    }

    @Transactional(readOnly = true)
    public List<EventResponse> getEventsByCreator(String authenticatedEmail) {
        User creator = resolveCreator(authenticatedEmail);
        List<Event> events = eventRepository.findByCreatorIdOrderByCreatedAtDesc(creator.getId());
        return events.stream()
                .map(EventResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EventResponse getEventById(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
        return EventResponse.fromEntity(event);
    }

    @Transactional
    public EventResponse updateEvent(Long eventId, UpdateEventRequest request, String authenticatedEmail) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        User creator = resolveCreator(authenticatedEmail);
        if (event.getCreator() != null && !event.getCreator().getId().equals(creator.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to modify this event");
        }

        event.setTitle(request.getTitle().trim());
        event.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        event.setLocation(request.getLocation().trim());
        event.setCapacity(request.getCapacity());
        event.setAgeRestriction(request.getAgeRestriction());
        event.setPrice(request.getPrice());
        if (request.getStatus() != null) {
            event.setStatus(request.getStatus());
        }

        Event updated = eventRepository.save(event);
        return EventResponse.fromEntity(updated);
    }

    @Transactional
    public EventResponse updateEventStatus(Long eventId, EventStatus newStatus, String authenticatedEmail) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        User creator = resolveCreator(authenticatedEmail);
        if (event.getCreator() != null && !event.getCreator().getId().equals(creator.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to modify this event");
        }

        event.setStatus(newStatus);
        Event updated = eventRepository.save(event);
        return EventResponse.fromEntity(updated);
    }

    /**
     * Resolves the creator user.
     * When authentication is in place, retrieves the user by email.
     * For local development/testing before US-09 auth sessions are active,
     * falls back to a default mock user.
     */
    private User resolveCreator(String email) {
        if (email != null && !email.isBlank() && !"anonymousUser".equalsIgnoreCase(email)) {
            return userRepository.findByEmail(email).orElseGet(() -> createMockUser(email));
        }
        // Local testing fallback mock user
        return userRepository.findByEmail("mock-creator@openfest.com")
                .orElseGet(() -> createMockUser("mock-creator@openfest.com"));
    }

    private User createMockUser(String email) {
        User mockUser = new User(email, passwordEncoder.encode("MockPassword123!"));
        return userRepository.save(mockUser);
    }
}
