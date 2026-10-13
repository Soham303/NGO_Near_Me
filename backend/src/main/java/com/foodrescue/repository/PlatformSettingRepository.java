package com.foodrescue.repository;

import com.foodrescue.entity.PlatformSettingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlatformSettingRepository extends JpaRepository<PlatformSettingEntity, String> {
}
