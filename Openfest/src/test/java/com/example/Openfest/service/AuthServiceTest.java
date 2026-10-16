package com.example.Openfest.service;

import com.example.Openfest.dto.RegisterRequest;
import com.example.Openfest.entity.User;
import com.example.Openfest.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        PasswordEncoder encoder = new BCryptPasswordEncoder();

        authService = new AuthService(
            userRepository, encoder
        );
    }

    @Test
    void registerUserSuccessfully() {

        RegisterRequest request = new RegisterRequest(
            "test@example.com",
            "SecurePass123!"
        );

        when(userRepository.existsByEmail(any()))
            .thenReturn(false);

        when(userRepository.save(any(User.class)))
            .thenAnswer(invocation -> {
                User user = invocation.getArgument(0);

                assertNotEquals(
                    "SecurePass123!",
                    user.getPasswordHash()
                );

                assertTrue(new BCryptPasswordEncoder()
                    .matches(
                        "SecurePass123!",
                        user.getPasswordHash()
                    ));

                return user;
            });

        authService.register(request);

        verify(userRepository).save(any(User.class));
    }

    @Test
    void duplicateEmailThrowsException() {

        RegisterRequest request = new RegisterRequest(
            "test@example.com",
            "SecurePass123!"
        );

        when(userRepository.existsByEmail(any()))
            .thenReturn(true);

        assertThrows(
            ResponseStatusException.class,
            () -> authService.register(request)
        );

        verify(userRepository, never())
            .save(any(User.class));
    }
}