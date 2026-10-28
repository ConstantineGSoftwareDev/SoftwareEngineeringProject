package com.example.Openfest.controller;

import com.example.Openfest.dto.RegisterRequest;
import com.example.Openfest.service.AuthService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.Authentication;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Long>> register(
            @Valid @RequestBody RegisterRequest request) {

        Long userId = authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(Map.of("id", userId));
    }

    
@GetMapping("/csrf")
public Map<String, String> csrf(CsrfToken token) {
    return Map.of(
        "headerName", token.getHeaderName(),
        "token", token.getToken()
    );
}

@GetMapping("/me")
public ResponseEntity<Map<String, String>> me(
        Authentication authentication) {

    if (authentication == null ||
        !authentication.isAuthenticated()) {
        return ResponseEntity
            .status(HttpStatus.UNAUTHORIZED)
            .build();
    }

    return ResponseEntity.ok(
        Map.of("email", authentication.getName())
    );
}


}