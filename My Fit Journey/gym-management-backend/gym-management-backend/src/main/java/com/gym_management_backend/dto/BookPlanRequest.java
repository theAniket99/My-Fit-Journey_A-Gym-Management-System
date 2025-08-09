package com.gym_management_backend.dto;

import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.NotNull;

@Getter
@Setter
public class BookPlanRequest {
    // You could extend this later for payment simulation details, etc.
    @NotNull(message = "Plan ID is required")
    private Long planId;
    
    // Optional: simulate payment completion flag, payment reference, etc.
    private Boolean paymentCompleted = true; // Default true for simulation
    private String paymentReference; // e.g. simulated UPI txn reference
}
