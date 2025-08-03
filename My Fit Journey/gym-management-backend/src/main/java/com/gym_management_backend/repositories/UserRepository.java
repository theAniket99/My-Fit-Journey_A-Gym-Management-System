package com.gym_management_backend.repositories;

import com.gym_management_backend.entities.User;
import com.gym_management_backend.entities.User.Role;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
    List<User> findByRoleAndActiveTrue(Role role);
    List<User> findByRole(Role role);

}

