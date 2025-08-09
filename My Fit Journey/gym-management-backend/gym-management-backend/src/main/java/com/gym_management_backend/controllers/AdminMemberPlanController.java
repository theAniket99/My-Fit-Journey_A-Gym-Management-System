package com.gym_management_backend.controllers;

//package: com.gym_management_backend.controllers;

import com.gym_management_backend.dto.UserPlanResponse;
import com.gym_management_backend.repositories.UserPlanRepository;
import com.gym_management_backend.entities.UserPlan;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/member-plans")
@PreAuthorize("hasRole('ADMIN')")
public class AdminMemberPlanController {

 private final UserPlanRepository userPlanRepository;

 public AdminMemberPlanController(UserPlanRepository userPlanRepository) {
     this.userPlanRepository = userPlanRepository;
 }

 @GetMapping
 public ResponseEntity<List<UserPlanResponse>> getAllUserPlans() {
     List<UserPlanResponse> result = userPlanRepository.findAll()
             .stream()
             .map(userPlan -> {
                 UserPlanResponse r = new UserPlanResponse();
                 r.setBookingId(userPlan.getId());
                 r.setPlanId(userPlan.getPlan().getId());
                 r.setPlanName(userPlan.getPlan().getName());
                 r.setBookingDate(userPlan.getBookingDate());
                 r.setPaymentCompleted(userPlan.getPaymentCompleted());
                 r.setPaymentReference(userPlan.getPaymentReference());
                 r.setActive(userPlan.getActive());
                 r.setPlanPrice(userPlan.getPlan().getPrice());
                 // Optionally add member name/email for frontend display
                 r.setMemberName(userPlan.getUser().getFullName());
                 r.setMemberEmail(userPlan.getUser().getEmail());
                 return r;
             })
             .collect(Collectors.toList());
     return ResponseEntity.ok(result);
 }

 @DeleteMapping("/{userPlanId}")
 public ResponseEntity<Void> deleteUserPlan(@PathVariable Long userPlanId) {
     if (userPlanRepository.existsById(userPlanId)) {
         userPlanRepository.deleteById(userPlanId);
         return ResponseEntity.noContent().build();
     }
     return ResponseEntity.notFound().build();
 }
}

