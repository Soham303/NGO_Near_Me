package com.foodrescue.dto;

import com.foodrescue.entity.enums.PickupStatus;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class PickupResponse {
    private UUID id;
    private UUID listingId;
    private ListingResponse listing;
    private UUID ngoId;
    private String ngoName;
    private UUID volunteerId;
    private String volunteerName;
    private String volunteerPhone;
    private PickupStatus status;
    private Instant claimedAt;
    private Instant startedAt;
    private Instant collectedAt;
    private Instant completedAt;
    private Boolean collectedInGeofence;
    private Integer portionsReceived;
    private Integer leftBehindPortions;
    private String photoPath;
    private String cancelReason;
    private Boolean voided;
    private Double currentLat;
    private Double currentLng;
    private Integer etaMinutes;
    private List<String> tags;
    private Instant createdAt;
}
