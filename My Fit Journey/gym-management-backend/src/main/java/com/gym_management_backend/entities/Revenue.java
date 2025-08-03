package com.gym_management_backend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "revenues")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Revenue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate revenueDate;

    @Column(nullable = false)
    private BigDecimal incomeFromPlans;

    @Column(nullable = false)
    private BigDecimal trainerSalaries;

    @Column(nullable = false)
    private BigDecimal equipmentCosts;

    // Additional helper method or transient fields can be added for total profit calculation
}
