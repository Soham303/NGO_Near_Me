package com.foodrescue.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum FoodDiet {
    VEG("veg"),
    NON_VEG("non_veg"),
    MIXED("mixed");

    private final String value;

    FoodDiet(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static FoodDiet fromValue(String value) {
        if (value == null) return VEG;
        for (FoodDiet diet : values()) {
            if (diet.value.equalsIgnoreCase(value) || diet.name().equalsIgnoreCase(value)) {
                return diet;
            }
        }
        return VEG;
    }
}
