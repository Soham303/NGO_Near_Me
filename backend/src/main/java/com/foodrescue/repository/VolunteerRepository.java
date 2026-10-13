package com.foodrescue.repository;

import com.foodrescue.entity.VolunteerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VolunteerRepository extends JpaRepository<VolunteerEntity, UUID> {
    Optional<VolunteerEntity> findByProfileId(UUID profileId);
    List<VolunteerEntity> findByNgoId(UUID ngoId);
    List<VolunteerEntity> findByActiveTrue();
}
