package com.foodrescue.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum TagKind {
    POSITIVE("positive"),
    ISSUE("issue");

    private final String value;

    TagKind(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static TagKind fromValue(String value) {
        if (value == null) return POSITIVE;
        for (TagKind kind : values()) {
            if (kind.value.equalsIgnoreCase(value) || kind.name().equalsIgnoreCase(value)) {
                return kind;
            }
        }
        return POSITIVE;
    }
}
