package com.foodrescue.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum VenueType {
    HOTEL("hotel"),
    RESTAURANT("restaurant"),
    BANQUET_HALL("banquet_hall"),
    HOSTEL("hostel");

    private final String value;

    VenueType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static VenueType fromValue(String value) {
        if (value == null) return HOTEL;
        for (VenueType vt : values()) {
            if (vt.value.equalsIgnoreCase(value) || vt.name().equalsIgnoreCase(value)) {
                return vt;
            }
        }
        return HOTEL;
    }
}
