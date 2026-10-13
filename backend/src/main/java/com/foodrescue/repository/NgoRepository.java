package com.foodrescue.repository;

import com.foodrescue.entity.NgoEntity;
import com.foodrescue.entity.enums.OrgStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NgoRepository extends JpaRepository<NgoEntity, UUID> {
    Optional<NgoEntity> findByOwnerId(UUID ownerId);
    List<NgoEntity> findByStatus(OrgStatus status);
}
