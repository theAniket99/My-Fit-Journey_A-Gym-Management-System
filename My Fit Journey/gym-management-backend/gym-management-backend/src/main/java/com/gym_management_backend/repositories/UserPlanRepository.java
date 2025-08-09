package com.gym_management_backend.repositories;

import com.gym_management_backend.entities.UserPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserPlanRepository extends JpaRepository<UserPlan, Long> {
    List<UserPlan> findByUserId(Long userId);
    List<UserPlan> findByPlanId(Long planId);
}
