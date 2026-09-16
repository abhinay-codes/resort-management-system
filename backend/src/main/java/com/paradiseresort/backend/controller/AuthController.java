package com.paradiseresort.backend.controller;

import com.paradiseresort.backend.dto.LoginRequest;
import com.paradiseresort.backend.dto.RegisterCustomerRequest;
import com.paradiseresort.backend.security.JwtService;
import com.paradiseresort.backend.service.UserService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService userService;

    public AuthController(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            UserService userService
    ) {
        this.authenticationManager =
                authenticationManager;

        this.jwtService =
                jwtService;

        this.userService =
                userService;
    }

    /*
     * ==========================================
     * CUSTOMER REGISTRATION
     * ==========================================
     *
     * POST /api/auth/register
     *
     * This endpoint is public because a customer
     * does not have an account yet.
     */

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(
            @Valid @RequestBody RegisterCustomerRequest request
    ) {

        Map<String, Object> response =
                userService.registerCustomer(
                        request
                );

        return ResponseEntity
                .status(201)
                .body(response);
    }

    /*
     * ==========================================
     * LOGIN
     * ==========================================
     *
     * POST /api/auth/login
     *
     * Works for:
     *
     * CUSTOMER
     * EMPLOYEE
     * ADMIN
     */

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request
    ) {

        String normalizedEmail =
                request.email()
                        .trim()
                        .toLowerCase(Locale.ROOT);

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                normalizedEmail,
                                request.password()
                        )
                );

        UserDetails userDetails =
                (UserDetails) authentication.getPrincipal();

        String token =
                jwtService.generateToken(
                        userDetails
                );

        String role =
                userDetails.getAuthorities()
                        .stream()
                        .findFirst()
                        .map(
                                authority ->
                                        authority
                                                .getAuthority()
                                                .replace(
                                                        "ROLE_",
                                                        ""
                                                )
                        )
                        .orElse("");

        return ResponseEntity.ok(
                Map.of(
                        "token",
                        token,

                        "role",
                        role
                )
        );
    }
}