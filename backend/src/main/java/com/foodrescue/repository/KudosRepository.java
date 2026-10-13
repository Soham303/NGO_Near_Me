package com.foodrescue.repository;

import com.foodrescue.entity.KudosEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface KudosRepository extends JpaRepository<KudosEntity, UUID> {
    List<KudosEntity> findByHotelId(UUID hotelId);
    boolean existsByUserIdAndHotelIdAndWeekStart(UUID userId, UUID hotelId, LocalDate weekStart);
    long countByHotelId(UUID hotelId);
}
