package com.gym_management_backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ClassSessionResponse {
    private Long id;
    private String className;
    private String description;
    private LocalDateTime scheduledAt;
    private Integer maxCapacity;
    private Long trainerId;
    private String trainerName;
}
