package com.foodrescue.repository;

import com.foodrescue.entity.NewsItemEntity;
import com.foodrescue.entity.enums.NewsStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NewsItemRepository extends JpaRepository<NewsItemEntity, UUID> {
    List<NewsItemEntity> findByStatusOrderByPinnedDescPublishedAtDesc(NewsStatus status);
    List<NewsItemEntity> findAllByOrderByPinnedDescPublishedAtDesc();
}
