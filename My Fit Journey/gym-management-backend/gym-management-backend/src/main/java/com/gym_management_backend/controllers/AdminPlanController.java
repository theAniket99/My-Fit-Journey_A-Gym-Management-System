package com.gym_management_backend.controllers;

import com.gym_management_backend.entities.Plan;
import com.gym_management_backend.repositories.PlanRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/plans")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPlanController {

    private final PlanRepository planRepository;

    public AdminPlanController(PlanRepository planRepository) {
        this.planRepository = planRepository;
    }

    // Get all plans
    @GetMapping
    public ResponseEntity<List<Plan>> getAllPlans() {
        List<Plan> plans = planRepository.findAll();
        return ResponseEntity.ok(plans);
    }

    // Get plan by ID
    @GetMapping("/{id}")
    public ResponseEntity<Plan> getPlanById(@PathVariable Long id) {
        return planRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create a new plan
    @PostMapping
    public ResponseEntity<Plan> createPlan(@Valid @RequestBody Plan plan) {
        Plan savedPlan = planRepository.save(plan);
        return ResponseEntity.ok(savedPlan);
    }

    // Update a plan
    @PutMapping("/{id}")
    public ResponseEntity<Plan> updatePlan(@PathVariable Long id,
                                           @Valid @RequestBody Plan planDetails) {
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
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete a plan
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlan(@PathVariable Long id) {
        if (planRepository.existsById(id)) {
            planRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
