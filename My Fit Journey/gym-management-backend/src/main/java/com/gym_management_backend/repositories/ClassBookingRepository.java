package com.gym_management_backend.repositories;

import com.gym_management_backend.entities.ClassBooking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClassBookingRepository extends JpaRepository<ClassBooking, Long> {

    // Find all bookings for a given member
    List<ClassBooking> findByMemberId(Long memberId);

    // Find all bookings for a specific class session
    List<ClassBooking> findByClassSessionId(Long classSessionId);
    
    long countByClassSessionIdAndActiveTrue(Long classSessionId);

}
