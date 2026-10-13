package com.foodrescue.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum FlagStatus {
    OPEN("open"),
    KEPT("kept"),
    CORRECTED("corrected"),
    VOIDED("voided");

    private final String value;

    FlagStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static FlagStatus fromValue(String value) {
        if (value == null) return OPEN;
        for (FlagStatus status : values()) {
            if (status.value.equalsIgnoreCase(value) || status.name().equalsIgnoreCase(value)) {
                return status;
            }
        }
        return OPEN;
    }
}
