package com.example.Openfest.service;

import com.example.Openfest.dto.RegisterRequest;
import com.example.Openfest.entity.User;
import com.example.Openfest.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Long register(RegisterRequest request) {

        String email = request.email()
                .trim()
                .toLowerCase(java.util.Locale.ROOT);

        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Email already registered"
            );
        }

        String hashedPassword =
                passwordEncoder.encode(request.password());

        User user = new User(email, hashedPassword);

        User savedUser = userRepository.save(user);

        return savedUser.getId();
    }
}