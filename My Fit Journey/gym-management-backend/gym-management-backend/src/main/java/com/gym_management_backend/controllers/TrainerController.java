package com.gym_management_backend.controllers;

import com.gym_management_backend.dto.ClassBookingResponse;
import com.gym_management_backend.dto.ClassSessionResponse;
import com.gym_management_backend.dto.CreateClassRequest;
import com.gym_management_backend.entities.ClassSession;
import com.gym_management_backend.entities.User;
import com.gym_management_backend.repositories.ClassSessionRepository;
import com.gym_management_backend.repositories.UserRepository;
import com.gym_management_backend.services.ClassBookingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/trainer/classes")
@PreAuthorize("hasRole('TRAINER')")
public class TrainerController {

    private final ClassSessionRepository classSessionRepository;
    private final UserRepository userRepository;
    private final ClassBookingService classBookingService;

    // Inject ClassBookingService along with repositories
    public TrainerController(ClassSessionRepository classSessionRepository,
                             UserRepository userRepository,
                             ClassBookingService classBookingService) {
        this.classSessionRepository = classSessionRepository;
        this.userRepository = userRepository;
        this.classBookingService = classBookingService;
    }

    // Create a new class session
    @PostMapping
    public ResponseEntity<ClassSessionResponse> createClass(@Valid @RequestBody CreateClassRequest request,
                                                           Authentication authentication) {
        String username = authentication.getName();
        User trainer = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Trainer not found"));

        ClassSession classSession = ClassSession.builder()
                .trainer(trainer)
                .className(request.getClassName())
                .description(request.getDescription())
                .scheduledAt(request.getScheduledAt())
                .maxCapacity(request.getMaxCapacity())
                .build();

        ClassSession saved = classSessionRepository.save(classSession);

        ClassSessionResponse response = mapToResponse(saved);
        return ResponseEntity.ok(response);
    }

    // Get all classes managed by the logged-in trainer
    @GetMapping
    public ResponseEntity<List<ClassSessionResponse>> getMyClasses(Authentication authentication) {
        System.out.println("ROLEs during /api/trainer/classes: " +
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getAuthorities());

        String username = authentication.getName();
        User trainer = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Trainer not found"));

        List<ClassSession> classes = classSessionRepository.findByTrainerId(trainer.getId());

        List<ClassSessionResponse> responseList = classes.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }

    // Update a class session by id - only the trainer who owns it can update
    @PutMapping("/{id}")
    public ResponseEntity<ClassSessionResponse> updateClass(@PathVariable Long id,
                                                           @Valid @RequestBody CreateClassRequest request,
                                                           Authentication authentication) {
        String username = authentication.getName();
        User trainer = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Trainer not found"));

        ClassSession existingSession = classSessionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Class session not found"));

        // Check ownership: only the trainer who owns the class can update it
        if (!existingSession.getTrainer().getId().equals(trainer.getId())) {
            return ResponseEntity.status(403).build();  // Forbidden
        }

        existingSession.setClassName(request.getClassName());
        existingSession.setDescription(request.getDescription());
        existingSession.setScheduledAt(request.getScheduledAt());
        existingSession.setMaxCapacity(request.getMaxCapacity());

        ClassSession updatedSession = classSessionRepository.save(existingSession);

        ClassSessionResponse response = mapToResponse(updatedSession);
        return ResponseEntity.ok(response);
    }

    // Delete a class session by id - only the trainer who owns it can delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClass(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        User trainer = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Trainer not found"));

        ClassSession existingSession = classSessionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Class session not found"));

        // Check ownership: only the trainer who owns the class can delete it
        if (!existingSession.getTrainer().getId().equals(trainer.getId())) {
            return ResponseEntity.status(403).build();  // Forbidden
        }

        classSessionRepository.delete(existingSession);
        return ResponseEntity.noContent().build();
    }

    // Get booked members for a specific class session
    @GetMapping("/{id}/bookings")
    public ResponseEntity<List<ClassBookingResponse>> getClassBookings(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        User trainer = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Trainer not found"));

        ClassSession classSession = classSessionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Class session not found"));

        if (!classSession.getTrainer().getId().equals(trainer.getId())) {
            return ResponseEntity.status(403).build();  // Forbidden
        }

        List<ClassBookingResponse> bookings = classBookingService.getBookingsForClassSession(id);
        return ResponseEntity.ok(bookings);
    }

    // Utility method to convert entity to response DTO
    private ClassSessionResponse mapToResponse(ClassSession classSession) {
        ClassSessionResponse response = new ClassSessionResponse();
        response.setId(classSession.getId());
        response.setClassName(classSession.getClassName());
        response.setDescription(classSession.getDescription());
        response.setScheduledAt(classSession.getScheduledAt());
        response.setMaxCapacity(classSession.getMaxCapacity());
        if (classSession.getTrainer() != null) {
            response.setTrainerId(classSession.getTrainer().getId());
            response.setTrainerName(classSession.getTrainer().getFullName());
        }
        return response;
    }
}
