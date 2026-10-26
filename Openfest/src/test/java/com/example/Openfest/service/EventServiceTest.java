package com.example.Openfest.service;

import com.example.Openfest.dto.CreateEventRequest;
import com.example.Openfest.dto.EventResponse;
import com.example.Openfest.entity.AgeRestriction;
import com.example.Openfest.entity.Event;
import com.example.Openfest.entity.EventStatus;
import com.example.Openfest.entity.User;
import com.example.Openfest.repository.EventRepository;
import com.example.Openfest.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private UserRepository userRepository;

    private EventService eventService;

    @BeforeEach
    void setUp() {
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        eventService = new EventService(eventRepository, userRepository, passwordEncoder);
    }

    @Test
    void createDraftEvent_WithAuthenticatedUser_Success() {
        User creator = new User("creator@openfest.com", "hashedPassword");
        CreateEventRequest request = new CreateEventRequest(
                "Outdoor Music Fest",
                "Great summer outdoors music",
                "Central Park, NY",
                500,
                AgeRestriction.ALL_AGES,
                new BigDecimal("25.00"),
                EventStatus.DRAFT
        );

        when(userRepository.findByEmail("creator@openfest.com")).thenReturn(Optional.of(creator));
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EventResponse response = eventService.createEvent(request, "creator@openfest.com");

        assertNotNull(response);
        assertEquals("Outdoor Music Fest", response.getTitle());
        assertEquals("Central Park, NY", response.getLocation());
        assertEquals(500, response.getCapacity());
        assertEquals(EventStatus.DRAFT, response.getStatus());
        assertEquals("creator@openfest.com", response.getCreatorEmail());
    }

    @Test
    void createPublishedEvent_FallbackMockUser_Success() {
        User mockUser = new User("mock-creator@openfest.com", "hashedPassword");
        CreateEventRequest request = new CreateEventRequest(
                "Food Truck Rally",
                "Delicious food outdoors",
                "Town Square",
                200,
                AgeRestriction.EIGHTEEN_PLUS,
                BigDecimal.ZERO,
                EventStatus.PUBLISHED
        );

        when(userRepository.findByEmail("mock-creator@openfest.com")).thenReturn(Optional.of(mockUser));
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When authenticatedEmail is null or anonymousUser, fallback to mock creator
        EventResponse response = eventService.createEvent(request, null);

        assertNotNull(response);
        assertEquals("Food Truck Rally", response.getTitle());
        assertEquals(EventStatus.PUBLISHED, response.getStatus());
        assertEquals("mock-creator@openfest.com", response.getCreatorEmail());
    }
}
