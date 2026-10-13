package com.foodrescue.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum NewsSource {
    INTERNAL("internal"),
    EXTERNAL("external");

    private final String value;

    NewsSource(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static NewsSource fromValue(String value) {
        if (value == null) return INTERNAL;
        for (NewsSource source : values()) {
            if (source.value.equalsIgnoreCase(value) || source.name().equalsIgnoreCase(value)) {
                return source;
            }
        }
        return INTERNAL;
    }
}
