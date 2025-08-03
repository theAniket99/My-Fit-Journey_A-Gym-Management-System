package com.gym_management_backend.services;

import com.gym_management_backend.dto.BookPlanRequest;
import com.gym_management_backend.dto.UserPlanResponse;
import com.gym_management_backend.entities.Plan;
import com.gym_management_backend.entities.User;
import com.gym_management_backend.entities.UserPlan;
import com.gym_management_backend.repositories.PlanRepository;
import com.gym_management_backend.repositories.UserPlanRepository;
import com.gym_management_backend.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserPlanService {

    private final UserRepository userRepository;
    private final PlanRepository planRepository;
    private final UserPlanRepository userPlanRepository;

    public UserPlanService(UserRepository userRepository,
                           PlanRepository planRepository,
                           UserPlanRepository userPlanRepository) {
        this.userRepository = userRepository;
        this.planRepository = planRepository;
        this.userPlanRepository = userPlanRepository;
    }

    // Book a plan for a user (simulate payment)
    public UserPlanResponse bookPlan(String username, BookPlanRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Plan plan = planRepository.findById(request.getPlanId())
                .orElseThrow(() -> new IllegalArgumentException("Plan not found"));

        UserPlan userPlan = UserPlan.builder()
                .user(user)
                .plan(plan)
                .bookingDate(LocalDateTime.now())
                .paymentCompleted(request.getPaymentCompleted() != null ? request.getPaymentCompleted() : true)
                .paymentReference(request.getPaymentReference())
                .active(true)
                .build();

        UserPlan saved = userPlanRepository.save(userPlan);
        return mapToResponse(saved);
    }

    // List all bookings for a user
    public List<UserPlanResponse> getBookingsForUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return userPlanRepository.findByUserId(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Cancel (deactivate) a booking by bookingId and username ownership check
    public void cancelBooking(String username, Long bookingId) {
        UserPlan userPlan = userPlanRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (!userPlan.getUser().getUsername().equals(username)) {
            throw new SecurityException("You can only cancel your own bookings");
        }

        userPlan.setActive(false);
        userPlanRepository.save(userPlan);
    }

    // Utility mapping method
    private UserPlanResponse mapToResponse(UserPlan userPlan) {
        UserPlanResponse response = new UserPlanResponse();
        response.setBookingId(userPlan.getId());
        response.setPlanId(userPlan.getPlan().getId());
        response.setPlanName(userPlan.getPlan().getName());
        response.setBookingDate(userPlan.getBookingDate());
        response.setPaymentCompleted(userPlan.getPaymentCompleted());
        response.setPaymentReference(userPlan.getPaymentReference());
        response.setActive(userPlan.getActive());
        return response;
    }
}
