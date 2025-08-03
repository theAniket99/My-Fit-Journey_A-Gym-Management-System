package com.gym_management_backend.controllers;
//package: com.gym_management_backend.controllers;

import com.gym_management_backend.entities.TrainerSalary;
import com.gym_management_backend.entities.User;
import com.gym_management_backend.repositories.TrainerSalaryRepository;
import com.gym_management_backend.repositories.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/trainer-salaries")
@PreAuthorize("hasRole('ADMIN')")
public class AdminTrainerSalaryController {

 private final TrainerSalaryRepository trainerSalaryRepository;
 private final UserRepository userRepository;

 public AdminTrainerSalaryController(TrainerSalaryRepository trainerSalaryRepository, UserRepository userRepository) {
     this.trainerSalaryRepository = trainerSalaryRepository;
     this.userRepository = userRepository;
 }

 @GetMapping
 public ResponseEntity<List<TrainerSalary>> getAllSalaries() {
     return ResponseEntity.ok(trainerSalaryRepository.findAll());
 }

 @GetMapping("/{trainerId}")
 public ResponseEntity<TrainerSalary> getSalaryByTrainerId(@PathVariable Long trainerId) {
     return trainerSalaryRepository.findByTrainerId(trainerId)
             .map(ResponseEntity::ok)
             .orElse(ResponseEntity.notFound().build());
 }

 @PostMapping
 public ResponseEntity<TrainerSalary> setOrUpdateSalary(@RequestParam Long trainerId, @RequestParam BigDecimal salary) {
     Optional<User> trainerOpt = userRepository.findById(trainerId);
     if (trainerOpt.isEmpty() || trainerOpt.get().getRole() != User.Role.TRAINER) {
         return ResponseEntity.badRequest().build();
     }
     TrainerSalary ts = trainerSalaryRepository.findByTrainerId(trainerId)
         .orElse(new TrainerSalary(null, trainerOpt.get(), salary, LocalDate.now()));
     ts.setSalary(salary);
     ts.setEffectiveFrom(LocalDate.now());
     return ResponseEntity.ok(trainerSalaryRepository.save(ts));
 }
}
