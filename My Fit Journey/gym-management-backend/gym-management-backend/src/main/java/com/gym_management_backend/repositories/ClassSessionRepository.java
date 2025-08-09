package com.gym_management_backend.repositories;

import com.gym_management_backend.entities.ClassSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClassSessionRepository extends JpaRepository<ClassSession, Long> {
    List<ClassSession> findByTrainerId(Long trainerId);
}

