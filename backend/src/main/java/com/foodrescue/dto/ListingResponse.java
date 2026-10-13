package com.foodrescue.dto;

import com.foodrescue.entity.enums.FoodDiet;
import com.foodrescue.entity.enums.ListingStatus;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class ListingResponse {
    private UUID id;
    private UUID hotelId;
    private String hotelName;
    private String hotelAddress;
    private Double lat;
    private Double lng;
    private String title;
    private String description;
    private FoodDiet diet;
    private Integer portionsListed;
    private Instant cookedAt;
    private Instant pickupBy;
    private String packagingNotes;
    private Boolean safetyConfirmed;
    private ListingStatus status;
    private Instant createdAt;
    private Double distanceKm;
}
