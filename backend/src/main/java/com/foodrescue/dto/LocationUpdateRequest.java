package com.foodrescue.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class LocationUpdateRequest {
    @NotNull
    private Double lat;

    @NotNull
    private Double lng;

    private Integer etaMinutes;
    private BigDecimal accuracyM = BigDecimal.valueOf(6.5);
}
