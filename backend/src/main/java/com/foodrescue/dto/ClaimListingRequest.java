package com.foodrescue.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class ClaimListingRequest {
    @NotNull
    private UUID listingId;

    @NotNull
    private UUID ngoId;

    private UUID volunteerId;
}
