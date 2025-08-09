package com.gym_management_backend.controllers;

import com.gym_management_backend.entities.User;
import com.gym_management_backend.repositories.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/trainers")
@PreAuthorize("hasRole('ADMIN')")
public class AdminTrainerController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminTrainerController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // List all trainers
    @GetMapping
    public ResponseEntity<List<User>> getAllTrainers() {
        List<User> trainers = userRepository.findAll().stream()
                .filter(user -> user.getRole() == User.Role.TRAINER)
                .collect(Collectors.toList());
        return ResponseEntity.ok(trainers);
    }

    // Get a trainer by ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getTrainerById(@PathVariable Long id) {
        return userRepository.findById(id)
                .filter(user -> user.getRole() == User.Role.TRAINER)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create a new trainer
    @PostMapping
    public ResponseEntity<User> createTrainer(@Valid @RequestBody User trainer) {
        // Ensure role is TRAINER explicitly
        trainer.setRole(User.Role.TRAINER);

        // Encode password before saving
        trainer.setPassword(passwordEncoder.encode(trainer.getPassword()));

        User savedTrainer = userRepository.save(trainer);
        return ResponseEntity.ok(savedTrainer);
    }

    // Update trainer info (name, email, password optional - encode if present)
    @PutMapping("/{id}")
    public ResponseEntity<User> updateTrainer(@PathVariable Long id,
                                              @Valid @RequestBody User updatedTrainer) {
        return userRepository.findById(id)
                .filter(user -> user.getRole() == User.Role.TRAINER)
                .map(trainer -> {
                    trainer.setFullName(updatedTrainer.getFullName());
                    trainer.setEmail(updatedTrainer.getEmail());
                    if (updatedTrainer.getPassword() != null && !updatedTrainer.getPassword().isBlank()) {
                        trainer.setPassword(passwordEncoder.encode(updatedTrainer.getPassword()));
                    }
                    User saved = userRepository.save(trainer);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete a trainer by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrainer(@PathVariable Long id) {
        return userRepository.findById(id)
                .filter(user -> user.getRole() == User.Role.TRAINER)
                .map(trainer -> {
                    userRepository.delete(trainer);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
