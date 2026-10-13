package com.foodrescue.entity;

import com.foodrescue.entity.enums.OrgStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ngos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NgoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "registration_no")
    private String registrationNo;

    @Column(name = "address", nullable = false)
    private String address;

    @Column(name = "lat")
    private Double lat;

    @Column(name = "lng")
    private Double lng;

    @Column(name = "capacity_portions")
    @Builder.Default
    private Integer capacityPortions = 0;

    @Column(name = "service_radius_km")
    @Builder.Default
    private BigDecimal serviceRadiusKm = BigDecimal.valueOf(10.0);

    @Column(name = "trust_score", nullable = false)
    @Builder.Default
    private BigDecimal trustScore = BigDecimal.valueOf(1.0);

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private OrgStatus status = OrgStatus.APPROVED;

    @Column(name = "verification_doc_path")
    private String verificationDocPath;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
