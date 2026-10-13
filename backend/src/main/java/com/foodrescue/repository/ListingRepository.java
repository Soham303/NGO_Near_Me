package com.foodrescue.repository;

import com.foodrescue.entity.ListingEntity;
import com.foodrescue.entity.enums.ListingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface ListingRepository extends JpaRepository<ListingEntity, UUID> {
    List<ListingEntity> findByHotelIdOrderByCreatedAtDesc(UUID hotelId);
    List<ListingEntity> findByStatusOrderByCreatedAtDesc(ListingStatus status);
    List<ListingEntity> findByStatusAndPickupByAfterOrderByPickupByAsc(ListingStatus status, Instant now);

    @Query(value = """
        SELECT l.* FROM listings l
        JOIN hotels h ON h.id = l.hotel_id
        WHERE l.status = 'posted'
          AND l.pickup_by > :now
          AND (
            6371 * acos(
              cos(radians(:lat)) * cos(radians(h.lat)) *
              cos(radians(h.lng) - radians(:lng)) +
              sin(radians(:lat)) * sin(radians(h.lat))
            )
          ) <= :radiusKm
        ORDER BY l.pickup_by ASC
        """, nativeQuery = true)
    List<ListingEntity> findNearbyListings(
        @Param("lat") double lat,
        @Param("lng") double lng,
        @Param("radiusKm") double radiusKm,
        @Param("now") Instant now
    );
}
