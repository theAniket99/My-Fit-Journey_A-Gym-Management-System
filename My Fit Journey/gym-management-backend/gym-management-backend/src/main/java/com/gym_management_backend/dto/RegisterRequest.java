package com.gym_management_backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    private String username;
    private String password;
    private String fullName;
    private String email;
    private String role; // Expect MEMBER or TRAINER (do NOT allow ADMIN via registration)
}
