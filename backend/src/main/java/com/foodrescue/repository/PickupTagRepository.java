package com.foodrescue.repository;

import com.foodrescue.entity.PickupTagEntity;
import com.foodrescue.entity.PickupTagId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PickupTagRepository extends JpaRepository<PickupTagEntity, PickupTagId> {
    @Query("SELECT pt.id.tagCode FROM PickupTagEntity pt WHERE pt.id.pickupId = :pickupId")
    List<String> findTagCodesByPickupId(@Param("pickupId") UUID pickupId);

    void deleteByIdPickupId(UUID pickupId);
}
