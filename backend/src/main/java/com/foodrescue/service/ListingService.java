package com.foodrescue.service;

import com.foodrescue.dto.CreateListingRequest;
import com.foodrescue.dto.ListingResponse;
import com.foodrescue.entity.HotelEntity;
import com.foodrescue.entity.ListingEntity;
import com.foodrescue.entity.enums.ListingStatus;
import com.foodrescue.repository.HotelRepository;
import com.foodrescue.repository.ListingRepository;
import lombok.RequiredArgsConstructor;
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
public class ListingService {

    private final ListingRepository listingRepository;
    private final HotelRepository hotelRepository;

    @Transactional(readOnly = true)
    public List<ListingResponse> getAllListings(ListingStatus status) {
        List<ListingEntity> entities = (status != null)
                ? listingRepository.findByStatusOrderByCreatedAtDesc(status)
                : listingRepository.findAll();

        Map<UUID, HotelEntity> hotelMap = hotelRepository.findAll().stream()
                .collect(Collectors.toMap(HotelEntity::getId, Function.identity(), (h1, h2) -> h1));

        return entities.stream()
                .map(entity -> toResponse(entity, hotelMap.get(entity.getHotelId()), null))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ListingResponse> getNearbyListings(double lat, double lng, double radiusKm) {
        List<ListingEntity> nearbyEntities = listingRepository.findNearbyListings(lat, lng, radiusKm, Instant.now());
        Map<UUID, HotelEntity> hotelMap = hotelRepository.findAll().stream()
                .collect(Collectors.toMap(HotelEntity::getId, Function.identity(), (h1, h2) -> h1));

        return nearbyEntities.stream().map(entity -> {
            HotelEntity hotel = hotelMap.get(entity.getHotelId());
            Double distance = null;
            if (hotel != null && hotel.getLat() != null && hotel.getLng() != null) {
                distance = calculateHaversineKm(lat, lng, hotel.getLat(), hotel.getLng());
            }
            return toResponse(entity, hotel, distance);
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ListingResponse getListingById(UUID id) {
        ListingEntity entity = listingRepository.findById(id).orElse(null);
        if (entity == null) return null;
        HotelEntity hotel = hotelRepository.findById(entity.getHotelId()).orElse(null);
        return toResponse(entity, hotel, null);
    }

    @Transactional
    public ListingResponse createListing(CreateListingRequest request) {
        if (request.getPickupBy().isBefore(request.getCookedAt())) {
            throw new IllegalArgumentException("Pickup deadline must be after cooked time");
        }

        HotelEntity hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new IllegalArgumentException("Hotel not found with ID: " + request.getHotelId()));

        ListingEntity entity = ListingEntity.builder()
                .hotelId(hotel.getId())
                .title(request.getTitle())
                .description(request.getDescription())
                .diet(request.getDiet())
                .portionsListed(request.getPortionsListed())
                .cookedAt(request.getCookedAt())
                .pickupBy(request.getPickupBy())
                .packagingNotes(request.getPackagingNotes())
                .safetyConfirmed(request.getSafetyConfirmed() != null ? request.getSafetyConfirmed() : true)
                .status(ListingStatus.POSTED)
                .build();

        entity = listingRepository.save(entity);
        return toResponse(entity, hotel, null);
    }

    @Transactional
    public boolean cancelListing(UUID id) {
        ListingEntity entity = listingRepository.findById(id).orElse(null);
        if (entity == null) return false;
        entity.setStatus(ListingStatus.CANCELLED);
        listingRepository.save(entity);
        return true;
    }

    private ListingResponse toResponse(ListingEntity entity, HotelEntity hotel, Double distanceKm) {
        return ListingResponse.builder()
                .id(entity.getId())
                .hotelId(entity.getHotelId())
                .hotelName(hotel != null ? hotel.getName() : "Hotel Partner")
                .hotelAddress(hotel != null ? hotel.getAddress() : "")
                .lat(hotel != null ? hotel.getLat() : null)
                .lng(hotel != null ? hotel.getLng() : null)
                .title(entity.getTitle())
                .description(entity.getDescription())
                .diet(entity.getDiet())
                .portionsListed(entity.getPortionsListed())
                .cookedAt(entity.getCookedAt())
                .pickupBy(entity.getPickupBy())
                .packagingNotes(entity.getPackagingNotes())
                .safetyConfirmed(entity.getSafetyConfirmed())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .distanceKm(distanceKm)
                .build();
    }

    private double calculateHaversineKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round((6371 * c) * 10.0) / 10.0;
    }
}
