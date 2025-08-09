package com.gym_management_backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ClassBookingResponse {
    private Long bookingId;
    private Long classSessionId;
    private String className;
    private LocalDateTime scheduledAt;
    private Boolean active;
    private LocalDateTime bookedAt;

    // New field to show member's full name for member dashboard and trainer dashboard views
    private String memberName;

    // Add attendance field if not present yet
    private Boolean present;
}
