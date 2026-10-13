package com.foodrescue.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ScoreTier {
    SEED("seed"),
    SPROUT("sprout"),
    CANOPY("canopy"),
    FOREST("forest");

    private final String value;

    ScoreTier(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static ScoreTier fromValue(String value) {
        if (value == null) return SEED;
        for (ScoreTier tier : values()) {
            if (tier.value.equalsIgnoreCase(value) || tier.name().equalsIgnoreCase(value)) {
                return tier;
            }
        }
        return SEED;
    }
}
