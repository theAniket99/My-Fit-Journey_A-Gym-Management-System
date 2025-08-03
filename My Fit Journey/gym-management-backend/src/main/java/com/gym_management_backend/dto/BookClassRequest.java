package com.gym_management_backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookClassRequest {

    @NotNull(message = "Class session ID is required to book a class")
    private Long classSessionId;
}
