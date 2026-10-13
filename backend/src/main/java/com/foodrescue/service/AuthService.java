package com.foodrescue.service;

import com.foodrescue.dto.SignUpRequest;
import com.foodrescue.dto.UserProfileResponse;
import com.foodrescue.entity.*;
import com.foodrescue.entity.enums.OrgStatus;
import com.foodrescue.entity.enums.UserRole;
import com.foodrescue.entity.enums.VenueType;
import com.foodrescue.repository.*;
import com.foodrescue.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final ProfileRepository profileRepository;
    private final HotelRepository hotelRepository;
    private final NgoRepository ngoRepository;
    private final VolunteerRepository volunteerRepository;

    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile(UUID userId) {
        ProfileEntity profile = profileRepository.findById(userId).orElse(null);
        HotelEntity hotel = null;
        NgoEntity ngo = null;
        VolunteerEntity volunteer = null;

        if (profile != null) {
            if (profile.getRole() == UserRole.HOTEL) {
                hotel = hotelRepository.findByOwnerId(userId).orElse(null);
            } else if (profile.getRole() == UserRole.NGO) {
                ngo = ngoRepository.findByOwnerId(userId).orElse(null);
            } else if (profile.getRole() == UserRole.VOLUNTEER) {
                volunteer = volunteerRepository.findByProfileId(userId).orElse(null);
            }
        }

        return UserProfileResponse.builder()
                .profile(profile)
                .hotel(hotel)
                .ngo(ngo)
                .volunteer(volunteer)
                .build();
    }

    @Transactional
    public UserProfileResponse registerUser(SignUpRequest request) {
        UUID userId = request.getId() != null ? request.getId() : UUID.randomUUID();

        // 1. Upsert Profile
        ProfileEntity profile = profileRepository.findById(userId)
                .orElse(ProfileEntity.builder().id(userId).build());

        profile.setRole(request.getRole());
        profile.setFullName(request.getFullName());
        profile.setEmail(request.getEmail());
        profile.setPhone(request.getPhone());
        profile = profileRepository.save(profile);

        HotelEntity hotel = null;
        NgoEntity ngo = null;
        VolunteerEntity volunteer = null;

        // 2. Create Role Entity
        if (request.getRole() == UserRole.HOTEL && request.getHotelData() != null) {
            String baseSlug = request.getHotelData().getName()
                    .toLowerCase()
                    .replaceAll("[^a-z0-9]+", "-")
                    .replaceAll("(^-|-$)+", "");
            String slug = baseSlug + "-" + UUID.randomUUID().toString().substring(0, 4);

            hotel = HotelEntity.builder()
                    .ownerId(userId)
                    .name(request.getHotelData().getName())
                    .slug(slug)
                    .venueType(request.getHotelData().getVenueType() != null ? request.getHotelData().getVenueType() : VenueType.HOTEL)
                    .address(request.getHotelData().getAddress())
                    .lat(request.getHotelData().getLat() != null ? request.getHotelData().getLat() : 12.9716)
                    .lng(request.getHotelData().getLng() != null ? request.getHotelData().getLng() : 77.5946)
                    .rooms(request.getHotelData().getRooms() != null ? request.getHotelData().getRooms() : 0)
                    .seats(request.getHotelData().getSeats() != null ? request.getHotelData().getSeats() : 0)
                    .banquetCapacity(request.getHotelData().getBanquetCapacity() != null ? request.getHotelData().getBanquetCapacity() : 0)
                    .eventsPerMonth(request.getHotelData().getEventsPerMonth() != null ? request.getHotelData().getEventsPerMonth() : 0)
                    .operatingDaysPerWeek(request.getHotelData().getOperatingDaysPerWeek() != null ? request.getHotelData().getOperatingDaysPerWeek() : 7)
                    .status(OrgStatus.APPROVED)
                    .publicListing(true)
                    .build();
            hotel = hotelRepository.save(hotel);
        } else if (request.getRole() == UserRole.NGO && request.getNgoData() != null) {
            ngo = NgoEntity.builder()
                    .ownerId(userId)
                    .name(request.getNgoData().getName())
                    .registrationNo(request.getNgoData().getRegistrationNo())
                    .address(request.getNgoData().getAddress())
                    .lat(request.getNgoData().getLat() != null ? request.getNgoData().getLat() : 12.9716)
                    .lng(request.getNgoData().getLng() != null ? request.getNgoData().getLng() : 77.5946)
                    .capacityPortions(request.getNgoData().getCapacityPortions() != null ? request.getNgoData().getCapacityPortions() : 400)
                    .serviceRadiusKm(request.getNgoData().getServiceRadiusKm() != null ? request.getNgoData().getServiceRadiusKm() : BigDecimal.valueOf(10.0))
                    .trustScore(BigDecimal.valueOf(1.0))
                    .status(OrgStatus.APPROVED)
                    .build();
            ngo = ngoRepository.save(ngo);
        } else if (request.getRole() == UserRole.VOLUNTEER && request.getVolunteerData() != null) {
            volunteer = VolunteerEntity.builder()
                    .profileId(userId)
                    .ngoId(request.getVolunteerData().getNgoId())
                    .name(request.getFullName())
                    .phone(request.getPhone())
                    .vehicle(request.getVolunteerData().getVehicle() != null ? request.getVolunteerData().getVehicle() : "Two-wheeler")
                    .active(true)
                    .build();
            volunteer = volunteerRepository.save(volunteer);
        }

        return UserProfileResponse.builder()
                .profile(profile)
                .hotel(hotel)
                .ngo(ngo)
                .volunteer(volunteer)
                .build();
    }
}
