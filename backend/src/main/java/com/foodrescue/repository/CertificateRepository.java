package com.foodrescue.repository;

import com.foodrescue.entity.CertificateEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CertificateRepository extends JpaRepository<CertificateEntity, UUID> {
    Optional<CertificateEntity> findByHotelIdAndMonth(UUID hotelId, LocalDate month);
    List<CertificateEntity> findByHotelIdOrderByMonthDesc(UUID hotelId);
}
