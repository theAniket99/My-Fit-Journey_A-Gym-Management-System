package com.gym_management_backend.controllers;

import com.gym_management_backend.entities.Plan;
import com.gym_management_backend.repositories.PlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/plans")
public class PlanController {

    private final PlanRepository planRepository;

    @Autowired
    public PlanController(PlanRepository planRepository) {
        this.planRepository = planRepository;
    }

    // Get all active plans - accessible by members and above
    @GetMapping
    @PreAuthorize("hasAnyRole('MEMBER', 'ADMIN', 'TRAINER')")
    public ResponseEntity<List<Plan>> getAllPlans() {
        List<Plan> plans = planRepository.findAll();
        return ResponseEntity.ok(plans);
    }

    // Create a new plan - Admin only
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Plan> createPlan(@RequestBody Plan plan) {
        Plan savedPlan = planRepository.save(plan);
        return ResponseEntity.ok(savedPlan);
    }

    // Update an existing plan - Admin only
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Plan> updatePlan(@PathVariable Long id, @RequestBody Plan planDetails) {
        return planRepository.findById(id)
            .map(plan -> {
                plan.setName(planDetails.getName());
                plan.setDescription(planDetails.getDescription());
                plan.setPrice(planDetails.getPrice());
                plan.setDurationInDays(planDetails.getDurationInDays());
                plan.setActive(planDetails.getActive());
                Plan updatedPlan = planRepository.save(plan);
                return ResponseEntity.ok(updatedPlan);
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Delete a plan - Admin only
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePlan(@PathVariable Long id) {
        return planRepository.findById(id)
            .map(plan -> {
                planRepository.delete(plan);
                return ResponseEntity.noContent().<Void>build();
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
