package com.foodrescue.repository;

import com.foodrescue.entity.TagEntity;
import com.foodrescue.entity.enums.TagKind;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TagRepository extends JpaRepository<TagEntity, String> {
    List<TagEntity> findByActiveTrue();
    List<TagEntity> findByKind(TagKind kind);
}
