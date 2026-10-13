package com.foodrescue.repository;

import com.foodrescue.entity.FollowEntity;
import com.foodrescue.entity.FollowId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FollowRepository extends JpaRepository<FollowEntity, FollowId> {
    List<FollowEntity> findByIdUserId(UUID userId);
    List<FollowEntity> findByIdHotelId(UUID hotelId);
    boolean existsByIdUserIdAndIdHotelId(UUID userId, UUID hotelId);
    void deleteByIdUserIdAndIdHotelId(UUID userId, UUID hotelId);
}
