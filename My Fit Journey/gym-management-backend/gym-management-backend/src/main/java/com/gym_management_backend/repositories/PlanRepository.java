package com.gym_management_backend.repositories;

import com.gym_management_backend.entities.Plan;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlanRepository extends JpaRepository<Plan, Long> {
    // Additional query methods if needed
}
