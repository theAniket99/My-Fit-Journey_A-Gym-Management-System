package com.gym_management_backend.repositories;

import com.gym_management_backend.entities.TrainerSalary;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TrainerSalaryRepository extends JpaRepository<TrainerSalary, Long> {
    Optional<TrainerSalary> findByTrainerId(Long trainerId);
    // Add more methods if needed (e.g., for history)
}
