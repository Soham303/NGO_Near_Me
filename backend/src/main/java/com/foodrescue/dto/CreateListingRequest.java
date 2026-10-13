package com.foodrescue.dto;

import com.foodrescue.entity.enums.FoodDiet;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class CreateListingRequest {
    @NotNull
    private UUID hotelId;

    @NotBlank
    private String title;

    private String description;

    @NotNull
    private FoodDiet diet;

    @NotNull
    @Min(1)
    private Integer portionsListed;

    @NotNull
    private Instant cookedAt;

    @NotNull
    private Instant pickupBy;

    private String packagingNotes;

    private Boolean safetyConfirmed = true;
}
