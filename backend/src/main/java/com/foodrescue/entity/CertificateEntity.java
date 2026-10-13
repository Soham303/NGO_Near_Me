package com.foodrescue.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "certificates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificateEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "hotel_id", nullable = false)
    private UUID hotelId;

    @Column(name = "month", nullable = false)
    private LocalDate month;

    @Column(name = "pdf_path", nullable = false)
    private String pdfPath;

    @Column(name = "meals", nullable = false)
    @Builder.Default
    private Integer meals = 0;

    @Column(name = "ngos_served", nullable = false)
    @Builder.Default
    private Integer ngosServed = 1;

    @Column(name = "co2_kg_avoided", nullable = false)
    @Builder.Default
    private BigDecimal co2KgAvoided = BigDecimal.ZERO;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
