package com.foodrescue.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum PickupStatus {
    CLAIMED("claimed"),
    ON_THE_WAY("on_the_way"),
    COLLECTED("collected"),
    COMPLETED("completed"),
    CANCELLED("cancelled");

    private final String value;

    PickupStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static PickupStatus fromValue(String value) {
        if (value == null) return CLAIMED;
        for (PickupStatus status : values()) {
            if (status.value.equalsIgnoreCase(value) || status.name().equalsIgnoreCase(value)) {
                return status;
            }
        }
        return CLAIMED;
    }
}
