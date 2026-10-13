package com.foodrescue.repository;

import com.foodrescue.entity.FlagEntity;
import com.foodrescue.entity.enums.FlagStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FlagRepository extends JpaRepository<FlagEntity, UUID> {
    List<FlagEntity> findByStatus(FlagStatus status);
    List<FlagEntity> findAllByOrderByCreatedAtDesc();
    List<FlagEntity> findByPickupId(UUID pickupId);
}
