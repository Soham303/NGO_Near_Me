package com.foodrescue.repository;

import com.foodrescue.entity.AdminActionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AdminActionRepository extends JpaRepository<AdminActionEntity, UUID> {
    List<AdminActionEntity> findAllByOrderByCreatedAtDesc();
}
