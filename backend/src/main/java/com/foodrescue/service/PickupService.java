package com.foodrescue.service;

import com.foodrescue.dto.*;
import com.foodrescue.entity.*;
import com.foodrescue.entity.enums.FlagStatus;
import com.foodrescue.entity.enums.ListingStatus;
import com.foodrescue.entity.enums.PickupStatus;
import com.foodrescue.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PickupService {

    private final PickupRepository pickupRepository;
    private final ListingRepository listingRepository;
    private final HotelRepository hotelRepository;
    private final NgoRepository ngoRepository;
    private final VolunteerRepository volunteerRepository;
    private final LocationPingRepository locationPingRepository;
    private final PickupTagRepository pickupTagRepository;
    private final FlagRepository flagRepository;

    @Transactional(readOnly = true)
    public List<PickupResponse> getAllPickups() {
        List<PickupEntity> pickups = pickupRepository.findAllByOrderByCreatedAtDesc();
        Map<UUID, ListingEntity> listingMap = listingRepository.findAll().stream()
                .collect(Collectors.toMap(ListingEntity::getId, Function.identity(), (l1, l2) -> l1));
        Map<UUID, HotelEntity> hotelMap = hotelRepository.findAll().stream()
                .collect(Collectors.toMap(HotelEntity::getId, Function.identity(), (h1, h2) -> h1));
        Map<UUID, NgoEntity> ngoMap = ngoRepository.findAll().stream()
                .collect(Collectors.toMap(NgoEntity::getId, Function.identity(), (n1, n2) -> n1));
        Map<UUID, VolunteerEntity> volMap = volunteerRepository.findAll().stream()
                .collect(Collectors.toMap(VolunteerEntity::getId, Function.identity(), (v1, v2) -> v1));

        return pickups.stream().map(p -> {
            ListingEntity listing = listingMap.get(p.getListingId());
            HotelEntity hotel = (listing != null) ? hotelMap.get(listing.getHotelId()) : null;
            NgoEntity ngo = ngoMap.get(p.getNgoId());
            VolunteerEntity vol = (p.getVolunteerId() != null) ? volMap.get(p.getVolunteerId()) : null;
            List<String> tags = pickupTagRepository.findTagCodesByPickupId(p.getId());

            return toResponse(p, listing, hotel, ngo, vol, tags);
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PickupResponse getPickupById(UUID id) {
        PickupEntity p = pickupRepository.findById(id).orElse(null);
        if (p == null) return null;

        ListingEntity listing = listingRepository.findById(p.getListingId()).orElse(null);
        HotelEntity hotel = (listing != null) ? hotelRepository.findById(listing.getHotelId()).orElse(null) : null;
        NgoEntity ngo = ngoRepository.findById(p.getNgoId()).orElse(null);
        VolunteerEntity vol = (p.getVolunteerId() != null) ? volunteerRepository.findById(p.getVolunteerId()).orElse(null) : null;
        List<String> tags = pickupTagRepository.findTagCodesByPickupId(p.getId());

        return toResponse(p, listing, hotel, ngo, vol, tags);
    }

    @Transactional
    public PickupResponse claimListing(ClaimListingRequest request) {
        ListingEntity listing = listingRepository.findById(request.getListingId())
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));

        if (listing.getStatus() != ListingStatus.POSTED) {
            throw new IllegalStateException("Listing has already been claimed or is unavailable");
        }
        if (listing.getPickupBy().isBefore(Instant.now())) {
            throw new IllegalStateException("Listing has expired");
        }

        // 1. Mark listing claimed
        listing.setStatus(ListingStatus.CLAIMED);
        listingRepository.save(listing);

        // 2. Create Pickup
        PickupEntity pickup = PickupEntity.builder()
                .listingId(listing.getId())
                .ngoId(request.getNgoId())
                .volunteerId(request.getVolunteerId())
                .status(PickupStatus.CLAIMED)
                .claimedAt(Instant.now())
                .build();
        pickup = pickupRepository.save(pickup);

        HotelEntity hotel = hotelRepository.findById(listing.getHotelId()).orElse(null);
        NgoEntity ngo = ngoRepository.findById(request.getNgoId()).orElse(null);
        VolunteerEntity vol = (request.getVolunteerId() != null) ? volunteerRepository.findById(request.getVolunteerId()).orElse(null) : null;

        return toResponse(pickup, listing, hotel, ngo, vol, List.of());
    }

    @Transactional
    public boolean releaseClaim(UUID pickupId) {
        PickupEntity pickup = pickupRepository.findById(pickupId).orElse(null);
        if (pickup == null) return false;

        pickup.setStatus(PickupStatus.CANCELLED);
        pickup.setCancelReason("Released by NGO");
        pickupRepository.save(pickup);

        listingRepository.findById(pickup.getListingId()).ifPresent(listing -> {
            listing.setStatus(ListingStatus.POSTED);
            listingRepository.save(listing);
        });

        return true;
    }

    @Transactional
    public void startTrip(UUID pickupId) {
        PickupEntity pickup = pickupRepository.findById(pickupId)
                .orElseThrow(() -> new IllegalArgumentException("Pickup not found"));

        pickup.setStatus(PickupStatus.ON_THE_WAY);
        pickup.setStartedAt(Instant.now());
        pickup.setCurrentLat(12.9645);
        pickup.setCurrentLng(77.6321);
        pickup.setEtaMinutes(8);
        pickupRepository.save(pickup);
    }

    @Transactional
    public void updateLocation(UUID pickupId, LocationUpdateRequest request) {
        PickupEntity pickup = pickupRepository.findById(pickupId)
                .orElseThrow(() -> new IllegalArgumentException("Pickup not found"));

        pickup.setCurrentLat(request.getLat());
        pickup.setCurrentLng(request.getLng());
        if (request.getEtaMinutes() != null) {
            pickup.setEtaMinutes(request.getEtaMinutes());
        }
        pickupRepository.save(pickup);

        // Record breadcrumb ping
        LocationPingEntity ping = LocationPingEntity.builder()
                .pickupId(pickupId)
                .lat(request.getLat())
                .lng(request.getLng())
                .accuracyM(request.getAccuracyM())
                .build();
        locationPingRepository.save(ping);
    }

    @Transactional
    public void recordHandoff(UUID pickupId, boolean inGeofence) {
        PickupEntity pickup = pickupRepository.findById(pickupId)
                .orElseThrow(() -> new IllegalArgumentException("Pickup not found"));

        pickup.setStatus(PickupStatus.COLLECTED);
        pickup.setCollectedAt(Instant.now());
        pickup.setCollectedInGeofence(inGeofence);
        pickupRepository.save(pickup);
    }

    @Transactional
    public void submitCompletionReport(UUID pickupId, CompletionReportRequest request) {
        PickupEntity pickup = pickupRepository.findById(pickupId)
                .orElseThrow(() -> new IllegalArgumentException("Pickup not found"));

        ListingEntity listing = listingRepository.findById(pickup.getListingId())
                .orElseThrow(() -> new IllegalArgumentException("Associated listing not found"));

        pickup.setStatus(PickupStatus.COMPLETED);
        pickup.setCompletedAt(Instant.now());
        pickup.setPortionsReceived(request.getPortionsReceived());
        pickup.setLeftBehindPortions(request.getLeftBehind());
        pickup.setPhotoPath(request.getPhotoUrl());
        pickupRepository.save(pickup);

        listing.setStatus(ListingStatus.COMPLETED);
        listingRepository.save(listing);

        // Save tags
        if (request.getTags() != null) {
            for (String tagCode : request.getTags()) {
                PickupTagId ptId = new PickupTagId(pickupId, tagCode);
                pickupTagRepository.save(new PickupTagEntity(ptId));
            }
        }

        // Auto-flagging logic:
        // Flag if portion mismatch is greater than 15%
        int listed = listing.getPortionsListed();
        int received = request.getPortionsReceived();
        double discrepancy = Math.abs(listed - received) / (double) listed;

        if (discrepancy > 0.15) {
            FlagEntity flag = FlagEntity.builder()
                    .pickupId(pickupId)
                    .reason(String.format("Quantity mismatch: listed %d portions, received %d portions (%.1f%% discrepancy)",
                            listed, received, discrepancy * 100))
                    .source("auto")
                    .status(FlagStatus.OPEN)
                    .build();
            flagRepository.save(flag);
        }

        if (request.getPhotoUrl() == null || request.getPhotoUrl().isBlank()) {
            FlagEntity flag = FlagEntity.builder()
                    .pickupId(pickupId)
                    .reason("Missing handoff verification photograph")
                    .source("auto")
                    .status(FlagStatus.OPEN)
                    .build();
            flagRepository.save(flag);
        }
    }

    @Transactional
    public void assignVolunteer(UUID pickupId, UUID volunteerId) {
        PickupEntity pickup = pickupRepository.findById(pickupId)
                .orElseThrow(() -> new IllegalArgumentException("Pickup not found"));
        pickup.setVolunteerId(volunteerId);
        pickupRepository.save(pickup);
    }

    private PickupResponse toResponse(PickupEntity p, ListingEntity listing, HotelEntity hotel,
                                      NgoEntity ngo, VolunteerEntity vol, List<String> tags) {
        ListingResponse listingResp = null;
        if (listing != null) {
            listingResp = ListingResponse.builder()
                    .id(listing.getId())
                    .hotelId(listing.getHotelId())
                    .hotelName(hotel != null ? hotel.getName() : "Hotel Partner")
                    .hotelAddress(hotel != null ? hotel.getAddress() : "")
                    .lat(hotel != null ? hotel.getLat() : null)
                    .lng(hotel != null ? hotel.getLng() : null)
                    .title(listing.getTitle())
                    .description(listing.getDescription())
                    .diet(listing.getDiet())
                    .portionsListed(listing.getPortionsListed())
                    .cookedAt(listing.getCookedAt())
                    .pickupBy(listing.getPickupBy())
                    .packagingNotes(listing.getPackagingNotes())
                    .safetyConfirmed(listing.getSafetyConfirmed())
                    .status(listing.getStatus())
                    .createdAt(listing.getCreatedAt())
                    .build();
        }

        return PickupResponse.builder()
                .id(p.getId())
                .listingId(p.getListingId())
                .listing(listingResp)
                .ngoId(p.getNgoId())
                .ngoName(ngo != null ? ngo.getName() : "Partner NGO")
                .volunteerId(p.getVolunteerId())
                .volunteerName(vol != null ? vol.getName() : null)
                .volunteerPhone(vol != null ? vol.getPhone() : null)
                .status(p.getStatus())
                .claimedAt(p.getClaimedAt())
                .startedAt(p.getStartedAt())
                .collectedAt(p.getCollectedAt())
                .completedAt(p.getCompletedAt())
                .collectedInGeofence(p.getCollectedInGeofence())
                .portionsReceived(p.getPortionsReceived())
                .leftBehindPortions(p.getLeftBehindPortions())
                .photoPath(p.getPhotoPath())
                .cancelReason(p.getCancelReason())
                .voided(p.getVoided())
                .currentLat(p.getCurrentLat())
                .currentLng(p.getCurrentLng())
                .etaMinutes(p.getEtaMinutes())
                .tags(tags)
                .createdAt(p.getCreatedAt())
                .build();
    }
}
