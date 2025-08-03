package com.gym_management_backend.controllers;

import com.gym_management_backend.dto.BookClassRequest;
import com.gym_management_backend.dto.ClassBookingResponse;
import com.gym_management_backend.dto.ClassSessionResponse;
import com.gym_management_backend.services.ClassBookingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/member/classes")
@PreAuthorize("hasRole('MEMBER')")
public class ClassBookingController {

    private final ClassBookingService classBookingService;

    public ClassBookingController(ClassBookingService classBookingService) {
        this.classBookingService = classBookingService;
    }

    // List all upcoming available class sessions for booking
    @GetMapping("/available")
    public ResponseEntity<List<ClassSessionResponse>> listAvailableClasses() {
        List<ClassSessionResponse> classes = classBookingService.listAvailableClasses();
        return ResponseEntity.ok(classes);
    }

    // Book a class session by member
    @PostMapping("/book")
    public ResponseEntity<ClassBookingResponse> bookClass(@Valid @RequestBody BookClassRequest request,
                                                          Authentication authentication) {
        String username = authentication.getName();
        ClassBookingResponse bookingResponse = classBookingService.bookClassSession(username, request);
        return ResponseEntity.ok(bookingResponse);
    }

    // List all bookings for the logged-in member
    @GetMapping("/bookings")
    public ResponseEntity<List<ClassBookingResponse>> getBookings(Authentication authentication) {
        String username = authentication.getName();
        List<ClassBookingResponse> bookings = classBookingService.getBookingsForMember(username);
        return ResponseEntity.ok(bookings);
    }

    // Cancel a booking by booking ID
    @DeleteMapping("/bookings/{bookingId}")
    public ResponseEntity<Void> cancelBooking(@PathVariable Long bookingId,
                                              Authentication authentication) {
        String username = authentication.getName();
        classBookingService.cancelBooking(username, bookingId);
        return ResponseEntity.noContent().build();
    }
}
