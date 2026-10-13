package com.foodrescue.dto;

import com.foodrescue.entity.enums.UserRole;
import com.foodrescue.entity.enums.VenueType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class SignUpRequest {
    private UUID id; // Optional, when coming from Supabase Auth signup trigger

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String fullName;

    private String phone;

    @NotNull
    private UserRole role;

    // Optional hotel specific details
    private HotelDetails hotelData;

    // Optional NGO specific details
    private NgoDetails ngoData;

    // Optional volunteer specific details
    private VolunteerDetails volunteerData;

    @Data
    public static class HotelDetails {
        private String name;
        private VenueType venueType;
        private String address;
        private Double lat;
        private Double lng;
        private Integer rooms;
        private Integer seats;
        private Integer banquetCapacity;
        private Integer eventsPerMonth;
        private Integer operatingDaysPerWeek;
    }

    @Data
    public static class NgoDetails {
        private String name;
        private String registrationNo;
        private String address;
        private Double lat;
        private Double lng;
        private Integer capacityPortions;
        private BigDecimal serviceRadiusKm;
    }

    @Data
    public static class VolunteerDetails {
        private UUID ngoId;
        private String vehicle;
    }
}
