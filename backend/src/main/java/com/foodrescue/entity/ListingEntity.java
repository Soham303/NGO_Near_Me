package com.foodrescue.entity;

import com.foodrescue.entity.enums.FoodDiet;
import com.foodrescue.entity.enums.ListingStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "listings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ListingEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "hotel_id", nullable = false)
    private UUID hotelId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "diet", nullable = false)
    private FoodDiet diet;

    @Column(name = "portions_listed", nullable = false)
    private Integer portionsListed;

    @Column(name = "cooked_at", nullable = false)
    private Instant cookedAt;

    @Column(name = "pickup_by", nullable = false)
    private Instant pickupBy;

    @Column(name = "packaging_notes")
    private String packagingNotes;

    @Column(name = "safety_confirmed", nullable = false)
    @Builder.Default
    private Boolean safetyConfirmed = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ListingStatus status = ListingStatus.POSTED;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
