package com.gym_management_backend.repositories;

import com.gym_management_backend.entities.Revenue;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.Optional;

public interface RevenueRepository extends JpaRepository<Revenue, Long> {
    Optional<Revenue> findByRevenueDate(LocalDate revenueDate);
}
