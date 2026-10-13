package com.foodrescue.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum NewsStatus {
    DRAFT("draft"),
    PUBLISHED("published"),
    HIDDEN("hidden");

    private final String value;

    NewsStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static NewsStatus fromValue(String value) {
        if (value == null) return DRAFT;
        for (NewsStatus status : values()) {
            if (status.value.equalsIgnoreCase(value) || status.name().equalsIgnoreCase(value)) {
                return status;
            }
        }
        return DRAFT;
    }
}
