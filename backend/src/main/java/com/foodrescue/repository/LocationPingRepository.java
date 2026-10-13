package com.foodrescue.repository;

import com.foodrescue.entity.LocationPingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LocationPingRepository extends JpaRepository<LocationPingEntity, Long> {
    List<LocationPingEntity> findByPickupIdOrderByRecordedAtDesc(UUID pickupId);
}
