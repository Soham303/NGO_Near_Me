package com.foodrescue.repository;

import com.foodrescue.entity.ScoreSnapshotEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ScoreSnapshotRepository extends JpaRepository<ScoreSnapshotEntity, UUID> {
    Optional<ScoreSnapshotEntity> findByHotelIdAndPeriodEnd(UUID hotelId, LocalDate periodEnd);
    List<ScoreSnapshotEntity> findByHotelIdOrderByPeriodEndDesc(UUID hotelId);
    
    @Query("SELECT s FROM ScoreSnapshotEntity s WHERE s.eligible = true ORDER BY s.composite DESC")
    List<ScoreSnapshotEntity> findLeaderboard();
}
