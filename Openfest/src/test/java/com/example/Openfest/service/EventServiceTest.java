package com.example.Openfest.service;

import com.example.Openfest.dto.CreateEventRequest;
import com.example.Openfest.dto.EventResponse;
import com.example.Openfest.dto.UpdateEventRequest;
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
import org.springframework.web.server.ResponseStatusException;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.util.List;
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

    private void setId(Object target, Long id) {
        try {
            Field idField = target.getClass().getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(target, id);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
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

        EventResponse response = eventService.createEvent(request, null);

        assertNotNull(response);
        assertEquals("Food Truck Rally", response.getTitle());
        assertEquals(EventStatus.PUBLISHED, response.getStatus());
        assertEquals("mock-creator@openfest.com", response.getCreatorEmail());
    }

    @Test
    void getEventsByCreator_ReturnsCreatorEvents() {
        User creator = new User("creator@openfest.com", "hashedPassword");
        setId(creator, 1L);

        Event event1 = new Event(creator, "Event 1", "Desc 1", "Loc 1", 100, AgeRestriction.ALL_AGES, BigDecimal.TEN, EventStatus.PUBLISHED);
        Event event2 = new Event(creator, "Event 2", "Desc 2", "Loc 2", 200, AgeRestriction.EIGHTEEN_PLUS, BigDecimal.ZERO, EventStatus.DRAFT);

        when(userRepository.findByEmail("creator@openfest.com")).thenReturn(Optional.of(creator));
        when(eventRepository.findByCreatorIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(event1, event2));

        List<EventResponse> events = eventService.getEventsByCreator("creator@openfest.com");

        assertEquals(2, events.size());
        assertEquals("Event 1", events.get(0).getTitle());
        assertEquals("Event 2", events.get(1).getTitle());
    }

    @Test
    void updateEvent_Success() {
        User creator = new User("creator@openfest.com", "hashedPassword");
        setId(creator, 1L);

        Event event = new Event(creator, "Old Title", "Old Desc", "Old Loc", 50, AgeRestriction.ALL_AGES, BigDecimal.ZERO, EventStatus.DRAFT);
        setId(event, 10L);

        UpdateEventRequest updateRequest = new UpdateEventRequest(
                "Updated Title",
                "Updated Desc",
                "New Loc",
                150,
                AgeRestriction.TWENTY_ONE_PLUS,
                new BigDecimal("15.50"),
                EventStatus.PUBLISHED
        );

        when(eventRepository.findById(10L)).thenReturn(Optional.of(event));
        when(userRepository.findByEmail("creator@openfest.com")).thenReturn(Optional.of(creator));
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EventResponse response = eventService.updateEvent(10L, updateRequest, "creator@openfest.com");

        assertEquals("Updated Title", response.getTitle());
        assertEquals("Updated Desc", response.getDescription());
        assertEquals("New Loc", response.getLocation());
        assertEquals(150, response.getCapacity());
        assertEquals(AgeRestriction.TWENTY_ONE_PLUS, response.getAgeRestriction());
        assertEquals(new BigDecimal("15.50"), response.getPrice());
        assertEquals(EventStatus.PUBLISHED, response.getStatus());
    }

    @Test
    void updateEventStatus_CloseSignUps_Success() {
        User creator = new User("creator@openfest.com", "hashedPassword");
        setId(creator, 1L);

        Event event = new Event(creator, "Fest", "Desc", "Loc", 100, AgeRestriction.ALL_AGES, BigDecimal.ZERO, EventStatus.PUBLISHED);
        setId(event, 20L);

        when(eventRepository.findById(20L)).thenReturn(Optional.of(event));
        when(userRepository.findByEmail("creator@openfest.com")).thenReturn(Optional.of(creator));
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EventResponse response = eventService.updateEventStatus(20L, EventStatus.CLOSED, "creator@openfest.com");

        assertEquals(EventStatus.CLOSED, response.getStatus());
    }

    @Test
    void updateEvent_UnauthorizedCreator_ThrowsResponseStatusException() {
        User creator = new User("creator@openfest.com", "hashedPassword");
        setId(creator, 1L);

        User anotherUser = new User("other@openfest.com", "hashedPassword");
        setId(anotherUser, 2L);

        Event event = new Event(creator, "Fest", "Desc", "Loc", 100, AgeRestriction.ALL_AGES, BigDecimal.ZERO, EventStatus.PUBLISHED);
        setId(event, 30L);

        when(eventRepository.findById(30L)).thenReturn(Optional.of(event));
        when(userRepository.findByEmail("other@openfest.com")).thenReturn(Optional.of(anotherUser));

        UpdateEventRequest updateRequest = new UpdateEventRequest(
                "Hijack", "Desc", "Loc", 10, AgeRestriction.ALL_AGES, BigDecimal.ZERO, EventStatus.PUBLISHED
        );

        assertThrows(ResponseStatusException.class, () ->
                eventService.updateEvent(30L, updateRequest, "other@openfest.com")
        );
    }
}
