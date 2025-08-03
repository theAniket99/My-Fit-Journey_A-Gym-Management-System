package com.gym_management_backend.services;

import com.gym_management_backend.dto.BookClassRequest;
import com.gym_management_backend.dto.ClassBookingResponse;
import com.gym_management_backend.dto.ClassSessionResponse;
import com.gym_management_backend.entities.ClassBooking;
import com.gym_management_backend.entities.ClassSession;
import com.gym_management_backend.entities.User;
import com.gym_management_backend.repositories.ClassBookingRepository;
import com.gym_management_backend.repositories.ClassSessionRepository;
import com.gym_management_backend.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ClassBookingService {

    private final UserRepository userRepository;
    private final ClassSessionRepository classSessionRepository;
    private final ClassBookingRepository classBookingRepository;

    public ClassBookingService(UserRepository userRepository,
                               ClassSessionRepository classSessionRepository,
                               ClassBookingRepository classBookingRepository) {
        this.userRepository = userRepository;
        this.classSessionRepository = classSessionRepository;
        this.classBookingRepository = classBookingRepository;
    }

    // List all upcoming class sessions (for member to browse and book)
    public List<ClassSessionResponse> listAvailableClasses() {
        LocalDateTime now = LocalDateTime.now();
        List<ClassSession> upcomingSessions = classSessionRepository.findAll().stream()
            .filter(cs -> cs.getScheduledAt().isAfter(now))
            .collect(Collectors.toList());

        // Map ClassSession entity to ClassSessionResponse DTO for frontend
        return upcomingSessions.stream()
            .map(this::mapToClassSessionResponse)
            .collect(Collectors.toList());
    }

    // Member books a class session with capacity and duplicate check
    public ClassBookingResponse bookClassSession(String username, BookClassRequest request) {
        User member = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));

        ClassSession classSession = classSessionRepository.findById(request.getClassSessionId())
                .orElseThrow(() -> new IllegalArgumentException("Class session not found"));

        // Capacity check
        if (classSession.getMaxCapacity() != null) {
            long activeBookings = classBookingRepository.countByClassSessionIdAndActiveTrue(classSession.getId());
            if (activeBookings >= classSession.getMaxCapacity()) {
                throw new IllegalStateException("Class is fully booked");
            }
        }

        // Duplicate booking check
        boolean alreadyBooked = classBookingRepository.findByClassSessionId(classSession.getId()).stream()
            .anyMatch(b -> b.getMember().getId().equals(member.getId()) && Boolean.TRUE.equals(b.getActive()));
        if (alreadyBooked) {
            throw new IllegalStateException("You have already booked this class session");
        }

        ClassBooking booking = ClassBooking.builder()
                .member(member)
                .classSession(classSession)
                .bookedAt(LocalDateTime.now())
                .active(true)
                .present(false)   // initially attendance unset
                .build();

        ClassBooking savedBooking = classBookingRepository.save(booking);

        return mapToBookingResponse(savedBooking);
    }

    // List all bookings for a member
    public List<ClassBookingResponse> getBookingsForMember(String username) {
        User member = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));

        return classBookingRepository.findByMemberId(member.getId()).stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    // Cancel a booking (mark as inactive)
    public void cancelBooking(String username, Long bookingId) {
        ClassBooking booking = classBookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (!booking.getMember().getUsername().equals(username)) {
            throw new SecurityException("You may only cancel your own bookings");
        }

        booking.setActive(false);
        classBookingRepository.save(booking);
    }

    // Get all bookings (members) for a given class session (used by trainers)
    public List<ClassBookingResponse> getBookingsForClassSession(Long classSessionId) {
        return classBookingRepository.findByClassSessionId(classSessionId).stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    // Map ClassBooking entity to ClassBookingResponse DTO
    private ClassBookingResponse mapToBookingResponse(ClassBooking booking) {
        ClassBookingResponse resp = new ClassBookingResponse();
        resp.setBookingId(booking.getId());
        resp.setClassSessionId(booking.getClassSession().getId());
        resp.setClassName(booking.getClassSession().getClassName());
        resp.setScheduledAt(booking.getClassSession().getScheduledAt());
        resp.setActive(booking.getActive());
        resp.setBookedAt(booking.getBookedAt());
        resp.setPresent(booking.getPresent());
        // Optional: Add member name
        if (booking.getMember() != null) {
            resp.setMemberName(booking.getMember().getFullName());
        }
        return resp;
    }

    // Map ClassSession entity to ClassSessionResponse DTO for member viewing
    private ClassSessionResponse mapToClassSessionResponse(ClassSession classSession) {
        ClassSessionResponse resp = new ClassSessionResponse();
        resp.setId(classSession.getId());
        resp.setClassName(classSession.getClassName());
        resp.setDescription(classSession.getDescription());
        resp.setScheduledAt(classSession.getScheduledAt());
        resp.setMaxCapacity(classSession.getMaxCapacity());
        if (classSession.getTrainer() != null) {
            resp.setTrainerId(classSession.getTrainer().getId());
            resp.setTrainerName(classSession.getTrainer().getFullName());
        }
        return resp;
    }
}
