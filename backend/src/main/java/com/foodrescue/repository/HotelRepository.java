package com.foodrescue.repository;

import com.foodrescue.entity.HotelEntity;
import com.foodrescue.entity.enums.OrgStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HotelRepository extends JpaRepository<HotelEntity, UUID> {
    Optional<HotelEntity> findByOwnerId(UUID ownerId);
    Optional<HotelEntity> findBySlug(String slug);
    List<HotelEntity> findByStatus(OrgStatus status);
    List<HotelEntity> findByPublicListingTrue();
}
