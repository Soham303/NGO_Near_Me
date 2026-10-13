package com.foodrescue.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "score_snapshots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScoreSnapshotEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "hotel_id", nullable = false)
    private UUID hotelId;

    @Column(name = "period_start", nullable = false)
    private LocalDate periodStart;

    @Column(name = "period_end", nullable = false)
    private LocalDate periodEnd;

    @Column(name = "completed_pickups", nullable = false)
    @Builder.Default
    private Integer completedPickups = 0;

    @Column(name = "portions_rescued", nullable = false)
    @Builder.Default
    private Integer portionsRescued = 0;

    @Column(name = "rescue_rate")
    private BigDecimal rescueRate;

    @Column(name = "participation")
    private BigDecimal participation;

    @Column(name = "listing_accuracy")
    private BigDecimal listingAccuracy;

    @Column(name = "handoff_quality")
    private BigDecimal handoffQuality;

    @Column(name = "left_behind")
    private BigDecimal leftBehind;

    @Column(name = "composite", nullable = false)
    @Builder.Default
    private BigDecimal composite = BigDecimal.valueOf(90.0);

    @Column(name = "tier", nullable = false)
    @Builder.Default
    private String tier = "forest";

    @Column(name = "rank_in_category")
    @Builder.Default
    private Integer rankInCategory = 1;

    @Column(name = "eligible", nullable = false)
    @Builder.Default
    private Boolean eligible = true;

    @Column(name = "streak_weeks")
    @Builder.Default
    private Integer streakWeeks = 4;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
