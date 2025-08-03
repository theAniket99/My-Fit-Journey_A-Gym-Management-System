package com.gym_management_backend.controllers;

import com.gym_management_backend.dto.BookPlanRequest;
import com.gym_management_backend.dto.UserPlanResponse;
import com.gym_management_backend.services.UserPlanService;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/member/bookings")
public class UserPlanController {

    private final UserPlanService userPlanService;

    public UserPlanController(UserPlanService userPlanService) {
        this.userPlanService = userPlanService;
    }

    // Member books a plan (simulate payment)
    @PostMapping("/book")
    public ResponseEntity<UserPlanResponse> bookPlan(Authentication authentication,
                                                    @Valid @RequestBody BookPlanRequest request) {
        String username = authentication.getName();
        UserPlanResponse response = userPlanService.bookPlan(username, request);
        return ResponseEntity.ok(response);
    }

    // Get all bookings for logged-in member
    @GetMapping
    public ResponseEntity<List<UserPlanResponse>> listBookings(Authentication authentication) {
        String username = authentication.getName();
        List<UserPlanResponse> bookings = userPlanService.getBookingsForUser(username);
        return ResponseEntity.ok(bookings);
    }

    // Cancel booking by booking id
    @DeleteMapping("/{bookingId}")
    public ResponseEntity<Void> cancelBooking(Authentication authentication,
                                              @PathVariable Long bookingId) {
        String username = authentication.getName();
        userPlanService.cancelBooking(username, bookingId);
        return ResponseEntity.noContent().build();
    }
}
