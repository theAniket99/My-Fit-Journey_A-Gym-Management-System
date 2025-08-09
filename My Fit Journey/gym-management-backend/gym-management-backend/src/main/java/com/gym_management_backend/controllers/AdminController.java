package com.gym_management_backend.controllers;

import com.gym_management_backend.entities.User;
import com.gym_management_backend.entities.User.Role;
import com.gym_management_backend.repositories.UserRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;

    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Get all users
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers(@RequestParam(required = false) String role) {
        List<User> users;
        if (role != null && !role.isEmpty()) {
            Role userRole;
            try {
                userRole = Role.valueOf(role.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
            users = userRepository.findByRole(userRole);
        } else {
            users = userRepository.findAll();
        }
        return ResponseEntity.ok(users);
    }

    // Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create a new user (admin creates member/trainer/admin)
    @PostMapping
    public ResponseEntity<User> createUser(@Valid @RequestBody User user) {
        // TODO: Consider password encoding here and role validation before saving
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }

    // Update user details
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @Valid @RequestBody User userDetails) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setFullName(userDetails.getFullName());
                    user.setEmail(userDetails.getEmail());
                    user.setRole(userDetails.getRole());
                    // TODO: Handle password encoding if password changed separately
                    User updatedUser = userRepository.save(user);
                    return ResponseEntity.ok(updatedUser);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete user
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Suspend or reactivate a user by toggling their 'active' status
    @PatchMapping("/{id}/active")
    public ResponseEntity<Void> setUserActiveStatus(@PathVariable Long id, @RequestParam boolean active) {
        return userRepository.findById(id)
                .<ResponseEntity<Void>>map(user -> {
                    user.setActive(active);
                    userRepository.save(user);
                    return ResponseEntity.noContent().build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
 // 🆕 Upload user photo
    @PostMapping("/{id}/photo")
    public ResponseEntity<?> uploadUserPhoto(@PathVariable Long id, @RequestParam("photo") MultipartFile file) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("No file uploaded.");
        }

        try {
            String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
            if (extension == null) {
                extension = "jpg"; // default
            } String folder = (user.getRole() == Role.TRAINER) ? "trainers" : "members";
            Path uploadPath = Paths.get("uploads", folder);
            Files.createDirectories(uploadPath);

            String filename = "user" + id + "." + extension;
            Path filePath = uploadPath.resolve(filename);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Save relative URL to DB
            user.setPhotoUrl("/images/" + folder + "/" + filename);
            userRepository.save(user);

            return ResponseEntity.ok("Photo uploaded successfully.");
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Photo upload failed.");
        }
    }


}
