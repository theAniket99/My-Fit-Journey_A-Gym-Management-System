package com.gym_management_backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class UserPlanResponse {
    private Long bookingId;
    private Long planId;
    private String planName;
    private LocalDateTime bookingDate;
    private Boolean paymentCompleted;
    private String paymentReference;
    private Boolean active;
    
    private String memberName;
    private String memberEmail;
    private BigDecimal planPrice; 
}
