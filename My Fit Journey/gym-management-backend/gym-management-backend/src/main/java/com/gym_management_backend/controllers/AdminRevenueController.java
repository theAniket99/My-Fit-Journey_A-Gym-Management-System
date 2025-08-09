package com.gym_management_backend.controllers;

import com.gym_management_backend.entities.Revenue;
import com.gym_management_backend.repositories.RevenueRepository;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/revenue")
@PreAuthorize("hasRole('ADMIN')")
public class AdminRevenueController {

    private final RevenueRepository revenueRepository;

    public AdminRevenueController(RevenueRepository revenueRepository) {
        this.revenueRepository = revenueRepository;
    }

    // Get all revenue records
    @GetMapping
    public ResponseEntity<List<Revenue>> getAllRevenue() {
        List<Revenue> revenues = revenueRepository.findAll();
        return ResponseEntity.ok(revenues);
    }

    // Get revenue record by date
    @GetMapping("/date/{date}")
    public ResponseEntity<Revenue> getRevenueByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        Optional<Revenue> revenueOpt = revenueRepository.findByRevenueDate(date);
        return revenueOpt.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create a new revenue record
    @PostMapping
    public ResponseEntity<Revenue> createRevenue(@Valid @RequestBody Revenue revenue) {
        Revenue saved = revenueRepository.save(revenue);
        return ResponseEntity.ok(saved);
    }

    // Update existing revenue record by ID
    @PutMapping("/{id}")
    public ResponseEntity<Revenue> updateRevenue(@PathVariable Long id,
                                                 @Valid @RequestBody Revenue revenueDetails) {
        return revenueRepository.findById(id)
                .map(revenue -> {
                    revenue.setRevenueDate(revenueDetails.getRevenueDate());
                    revenue.setIncomeFromPlans(revenueDetails.getIncomeFromPlans());
                    revenue.setTrainerSalaries(revenueDetails.getTrainerSalaries());
                    revenue.setEquipmentCosts(revenueDetails.getEquipmentCosts());
                    Revenue updated = revenueRepository.save(revenue);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete a revenue record by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRevenue(@PathVariable Long id) {
        if (revenueRepository.existsById(id)) {
            revenueRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
