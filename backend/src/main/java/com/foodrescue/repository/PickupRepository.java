package com.foodrescue.repository;

import com.foodrescue.entity.PickupEntity;
import com.foodrescue.entity.enums.PickupStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PickupRepository extends JpaRepository<PickupEntity, UUID> {
    Optional<PickupEntity> findByListingId(UUID listingId);
    List<PickupEntity> findByNgoIdOrderByCreatedAtDesc(UUID ngoId);
    List<PickupEntity> findByVolunteerIdOrderByCreatedAtDesc(UUID volunteerId);
    List<PickupEntity> findByStatus(PickupStatus status);
    List<PickupEntity> findAllByOrderByCreatedAtDesc();
}
