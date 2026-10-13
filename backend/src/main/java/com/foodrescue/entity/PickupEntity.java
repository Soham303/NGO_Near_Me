package com.foodrescue.entity;

import com.foodrescue.entity.enums.PickupStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "pickups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PickupEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "listing_id", nullable = false)
    private UUID listingId;

    @Column(name = "ngo_id", nullable = false)
    private UUID ngoId;

    @Column(name = "volunteer_id")
    private UUID volunteerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private PickupStatus status = PickupStatus.CLAIMED;

    @CreationTimestamp
    @Column(name = "claimed_at", nullable = false)
    private Instant claimedAt;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "collected_at")
    private Instant collectedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "collected_in_geofence")
    @Builder.Default
    private Boolean collectedInGeofence = true;

    @Column(name = "portions_received")
    private Integer portionsReceived;

    @Column(name = "left_behind_portions")
    @Builder.Default
    private Integer leftBehindPortions = 0;

    @Column(name = "photo_path")
    private String photoPath;

    @Column(name = "cancel_reason")
    private String cancelReason;

    @Column(name = "voided", nullable = false)
    @Builder.Default
    private Boolean voided = false;

    @Column(name = "current_lat")
    private Double currentLat;

    @Column(name = "current_lng")
    private Double currentLng;

    @Column(name = "eta_minutes")
    private Integer etaMinutes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
