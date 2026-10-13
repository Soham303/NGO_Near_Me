package com.foodrescue.entity;

import com.foodrescue.entity.enums.OrgStatus;
import com.foodrescue.entity.enums.VenueType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "hotels")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "slug", nullable = false, unique = true)
    private String slug;

    @Enumerated(EnumType.STRING)
    @Column(name = "venue_type", nullable = false)
    private VenueType venueType;

    @Column(name = "address", nullable = false)
    private String address;

    @Column(name = "lat")
    private Double lat;

    @Column(name = "lng")
    private Double lng;

    @Column(name = "rooms")
    @Builder.Default
    private Integer rooms = 0;

    @Column(name = "seats")
    @Builder.Default
    private Integer seats = 0;

    @Column(name = "banquet_capacity")
    @Builder.Default
    private Integer banquetCapacity = 0;

    @Column(name = "events_per_month")
    @Builder.Default
    private Integer eventsPerMonth = 0;

    @Column(name = "operating_days_per_week")
    @Builder.Default
    private Integer operatingDaysPerWeek = 7;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private OrgStatus status = OrgStatus.APPROVED;

    @Column(name = "public_listing", nullable = false)
    @Builder.Default
    private Boolean publicListing = true;

    @Column(name = "verification_doc_path")
    private String verificationDocPath;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
