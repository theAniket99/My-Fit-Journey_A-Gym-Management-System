package com.gym_management_backend.controllers;

import com.gym_management_backend.dto.AuthRequest;
import com.gym_management_backend.dto.AuthResponse;
import com.gym_management_backend.dto.RegisterRequest;
import com.gym_management_backend.entities.User;
import com.gym_management_backend.repositories.UserRepository;
import com.gym_management_backend.security.CustomUserDetailsService;
import com.gym_management_backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public AuthController(AuthenticationManager authenticationManager,
                          CustomUserDetailsService userDetailsService,
                          JwtUtil jwtUtil,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // LOGIN endpoint (unchanged)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest authRequest) {
        try {
            // Perform authentication
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            authRequest.getUsername(),
                            authRequest.getPassword())
            );
        } catch (BadCredentialsException e) {
            // Authentication failed
            return ResponseEntity.status(401).body("Invalid username or password");
        }

        // If authentication successful, generate JWT token
        final UserDetails userDetails = userDetailsService.loadUserByUsername(authRequest.getUsername());
        final String token = jwtUtil.generateToken(userDetails);

        // Return token in response body
        return ResponseEntity.ok(new AuthResponse(token));
    }


    // NEW: USER REGISTRATION endpoint
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody @Valid RegisterRequest req) {
        // Check if username already exists
        if (userRepository.existsByUsername(req.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        // Check if email already exists
        if (userRepository.existsByEmail(req.getEmail())) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        // Validate and parse role
        User.Role role;
        try {
            role = User.Role.valueOf(req.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid role specified");
        }

        // Ideally only allow MEMBER or TRAINER roles to register here (disallow ADMIN)
        if (role == User.Role.ADMIN) {
            return ResponseEntity.badRequest().body("Cannot register with ADMIN role");
        }

        // Create new user entity, encode password
        User user = User.builder()
                .username(req.getUsername())
                .password(passwordEncoder.encode(req.getPassword()))
                .fullName(req.getFullName())
                .email(req.getEmail())
                .role(role)
                .active(true)
                .build();

        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully");
    }
}
