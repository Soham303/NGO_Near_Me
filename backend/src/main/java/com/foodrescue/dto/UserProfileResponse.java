package com.foodrescue.dto;

import com.foodrescue.entity.HotelEntity;
import com.foodrescue.entity.NgoEntity;
import com.foodrescue.entity.ProfileEntity;
import com.foodrescue.entity.VolunteerEntity;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserProfileResponse {
    private ProfileEntity profile;
    private HotelEntity hotel;
    private NgoEntity ngo;
    private VolunteerEntity volunteer;
}
