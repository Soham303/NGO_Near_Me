package com.foodrescue.service;

import com.foodrescue.entity.HotelEntity;
import com.foodrescue.entity.ListingEntity;
import com.foodrescue.entity.PickupEntity;
import com.foodrescue.entity.ScoreSnapshotEntity;
import com.foodrescue.entity.enums.PickupStatus;
import com.foodrescue.repository.HotelRepository;
import com.foodrescue.repository.ListingRepository;
import com.foodrescue.repository.PickupRepository;
import com.foodrescue.repository.ScoreSnapshotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScoringService {

    private final ScoreSnapshotRepository scoreSnapshotRepository;
    private final HotelRepository hotelRepository;
    private final ListingRepository listingRepository;
    private final PickupRepository pickupRepository;

    @Transactional(readOnly = true)
    public List<ScoreSnapshotEntity> getLeaderboard() {
        return scoreSnapshotRepository.findLeaderboard();
    }

    @Transactional(readOnly = true)
    public List<ScoreSnapshotEntity> getHotelScores(UUID hotelId) {
        return scoreSnapshotRepository.findByHotelIdOrderByPeriodEndDesc(hotelId);
    }

    @Transactional(readOnly = true)
    public ScoreSnapshotEntity getLatestScoreForHotel(UUID hotelId) {
        List<ScoreSnapshotEntity> scores = scoreSnapshotRepository.findByHotelIdOrderByPeriodEndDesc(hotelId);
        return scores.isEmpty() ? null : scores.get(0);
    }

    @Transactional
    public ScoreSnapshotEntity recomputeScoreForHotel(UUID hotelId) {
        HotelEntity hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new IllegalArgumentException("Hotel not found"));

        List<ListingEntity> listings = listingRepository.findByHotelIdOrderByCreatedAtDesc(hotelId);
        List<PickupEntity> allPickups = pickupRepository.findAll();

        int completedPickups = 0;
        int portionsRescued = 0;
        int totalPortionsListed = 0;

        for (ListingEntity listing : listings) {
            totalPortionsListed += listing.getPortionsListed();
            for (PickupEntity p : allPickups) {
                if (p.getListingId().equals(listing.getId()) && p.getStatus() == PickupStatus.COMPLETED && !p.getVoided()) {
                    completedPickups++;
                    portionsRescued += (p.getPortionsReceived() != null ? p.getPortionsReceived() : listing.getPortionsListed());
                }
            }
        }

        double rescueRate = (totalPortionsListed > 0) ? Math.min(1.0, (double) portionsRescued / totalPortionsListed) : 0.95;
        double participation = Math.min(1.0, completedPickups / 10.0);
        double listingAccuracy = 0.95;
        double handoffQuality = 0.92;

        // Weights: 40% rescue rate, 25% participation, 20% accuracy, 15% handoff quality
        double composite = (rescueRate * 40.0) + (participation * 25.0) + (listingAccuracy * 20.0) + (handoffQuality * 15.0);
        composite = Math.max(10.0, Math.min(100.0, composite));

        String tier;
        if (composite >= 85.0) {
            tier = "forest";
        } else if (composite >= 70.0) {
            tier = "canopy";
        } else if (composite >= 50.0) {
            tier = "sprout";
        } else {
            tier = "seed";
        }

        LocalDate now = LocalDate.now();
        LocalDate periodStart = now.minusDays(60);

        ScoreSnapshotEntity snapshot = scoreSnapshotRepository.findByHotelIdAndPeriodEnd(hotelId, now)
                .orElse(ScoreSnapshotEntity.builder()
                        .hotelId(hotelId)
                        .periodStart(periodStart)
                        .periodEnd(now)
                        .build());

        snapshot.setCompletedPickups(completedPickups);
        snapshot.setPortionsRescued(portionsRescued);
        snapshot.setRescueRate(BigDecimal.valueOf(rescueRate).setScale(2, RoundingMode.HALF_UP));
        snapshot.setParticipation(BigDecimal.valueOf(participation).setScale(2, RoundingMode.HALF_UP));
        snapshot.setListingAccuracy(BigDecimal.valueOf(listingAccuracy).setScale(2, RoundingMode.HALF_UP));
        snapshot.setHandoffQuality(BigDecimal.valueOf(handoffQuality).setScale(2, RoundingMode.HALF_UP));
        snapshot.setComposite(BigDecimal.valueOf(composite).setScale(1, RoundingMode.HALF_UP));
        snapshot.setTier(tier);
        snapshot.setEligible(completedPickups >= 3);

        return scoreSnapshotRepository.save(snapshot);
    }

    // Weekly scheduled score update job
    @Scheduled(cron = "0 0 2 * * MON")
    @Transactional
    public void runWeeklyScoreJob() {
        log.info("Starting weekly hotel scoring update...");
        List<HotelEntity> hotels = hotelRepository.findAll();
        for (HotelEntity hotel : hotels) {
            try {
                recomputeScoreForHotel(hotel.getId());
            } catch (Exception ex) {
                log.error("Failed to calculate score for hotel: {}", hotel.getId(), ex);
            }
        }
        log.info("Weekly scoring job completed successfully");
    }
}
