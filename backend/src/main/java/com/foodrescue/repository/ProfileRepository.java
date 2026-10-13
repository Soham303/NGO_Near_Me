package com.foodrescue.repository;

import com.foodrescue.entity.ProfileEntity;
import com.foodrescue.entity.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProfileRepository extends JpaRepository<ProfileEntity, UUID> {
    Optional<ProfileEntity> findByEmail(String email);
    List<ProfileEntity> findByRole(UserRole role);
}
