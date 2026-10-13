package com.foodrescue.config;

import com.foodrescue.entity.*;
import com.foodrescue.entity.enums.*;
import com.foodrescue.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final ProfileRepository profileRepository;
    private final HotelRepository hotelRepository;
    private final NgoRepository ngoRepository;
    private final VolunteerRepository volunteerRepository;
    private final ListingRepository listingRepository;
    private final ScoreSnapshotRepository scoreSnapshotRepository;
    private final NewsItemRepository newsItemRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (profileRepository.count() > 0) {
            log.info("Database already contains data; skipping initial seed.");
            return;
        }

        log.info("Seeding initial FoodRescue demo entities...");

        // 1. Profiles
        UUID hotel1OwnerId = UUID.fromString("11111111-1111-4111-a111-111111111111");
        ProfileEntity p1 = ProfileEntity.builder()
                .id(hotel1OwnerId)
                .role(UserRole.HOTEL)
                .fullName("Chef Rajesh Nair")
                .phone("+91 98450 12345")
                .email("kitchen@grandpalace.com")
                .avatarUrl("https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150")
                .build();
        profileRepository.save(p1);

        UUID ngo1OwnerId = UUID.fromString("22222222-2222-4222-a222-111111111111");
        ProfileEntity p2 = ProfileEntity.builder()
                .id(ngo1OwnerId)
                .role(UserRole.NGO)
                .fullName("Sister Teresa Maria")
                .phone("+91 99000 11111")
                .email("coordinator@robinhoodkitchen.org")
                .avatarUrl("https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150")
                .build();
        profileRepository.save(p2);

        UUID vol1ProfileId = UUID.fromString("33333333-3333-4333-a333-111111111111");
        ProfileEntity p3 = ProfileEntity.builder()
                .id(vol1ProfileId)
                .role(UserRole.VOLUNTEER)
                .fullName("Arun Kumar")
                .phone("+91 97400 55555")
                .email("arun.k@volunteer.org")
                .avatarUrl("https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150")
                .build();
        profileRepository.save(p3);

        // 2. Hotels
        UUID hotel1Id = UUID.fromString("aaaaaaaa-aaaa-4aaa-aaaa-111111111111");
        HotelEntity h1 = HotelEntity.builder()
                .id(hotel1Id)
                .ownerId(hotel1OwnerId)
                .name("The Grand Palace Hotel")
                .slug("grand-palace-hotel")
                .venueType(VenueType.HOTEL)
                .address("24 MG Road, Ashok Nagar, Bengaluru 560001")
                .lat(12.9756)
                .lng(77.6067)
                .rooms(180)
                .seats(120)
                .banquetCapacity(450)
                .eventsPerMonth(8)
                .operatingDaysPerWeek(7)
                .status(OrgStatus.APPROVED)
                .publicListing(true)
                .build();
        hotelRepository.save(h1);

        // 3. NGOs
        UUID ngo1Id = UUID.fromString("bbbbbbbb-bbbb-4bbb-bbbb-111111111111");
        NgoEntity n1 = NgoEntity.builder()
                .id(ngo1Id)
                .ownerId(ngo1OwnerId)
                .name("Robin Hood Community Kitchen")
                .registrationNo("NGO-BLR-2021-4892")
                .address("12 Victoria Road, Austin Town, Bengaluru 560047")
                .lat(12.9645)
                .lng(77.6189)
                .capacityPortions(500)
                .serviceRadiusKm(BigDecimal.valueOf(12.0))
                .trustScore(BigDecimal.valueOf(0.98))
                .status(OrgStatus.APPROVED)
                .build();
        ngoRepository.save(n1);

        // 4. Volunteers
        VolunteerEntity v1 = VolunteerEntity.builder()
                .id(UUID.fromString("cccccccc-cccc-4ccc-cccc-111111111111"))
                .profileId(vol1ProfileId)
                .ngoId(ngo1Id)
                .name("Arun Kumar")
                .phone("+91 97400 55555")
                .vehicle("Scooter with Insulated Thermal Box (50L)")
                .active(true)
                .build();
        volunteerRepository.save(v1);

        // 5. Listings
        Instant now = Instant.now();
        ListingEntity l1 = ListingEntity.builder()
                .id(UUID.fromString("dddddddd-dddd-4ddd-dddd-111111111111"))
                .hotelId(hotel1Id)
                .title("Executive Lunch Buffet Surplus & Steamed Basmati")
                .description("Includes Dal Makhani, Paneer Butter Masala, Mixed Veg Curry, and Naan breads. Temperature maintained at 65°C.")
                .diet(FoodDiet.VEG)
                .portionsListed(45)
                .cookedAt(now.minus(1, ChronoUnit.HOURS))
                .pickupBy(now.plus(3, ChronoUnit.HOURS))
                .packagingNotes("Stored in 3 clean SS milk cans and foil boxes. Collect at Service Ramp #2.")
                .safetyConfirmed(true)
                .status(ListingStatus.POSTED)
                .build();
        listingRepository.save(l1);

        // 6. Scores
        ScoreSnapshotEntity score1 = ScoreSnapshotEntity.builder()
                .id(UUID.fromString("eeeeeeee-eeee-4eee-eeee-111111111111"))
                .hotelId(hotel1Id)
                .periodStart(LocalDate.now().minusDays(60))
                .periodEnd(LocalDate.now())
                .completedPickups(34)
                .portionsRescued(1820)
                .rescueRate(BigDecimal.valueOf(0.94))
                .participation(BigDecimal.valueOf(0.92))
                .listingAccuracy(BigDecimal.valueOf(0.96))
                .handoffQuality(BigDecimal.valueOf(0.95))
                .leftBehind(BigDecimal.valueOf(0.02))
                .composite(BigDecimal.valueOf(94.8))
                .tier("forest")
                .rankInCategory(1)
                .eligible(true)
                .streakWeeks(8)
                .build();
        scoreSnapshotRepository.save(score1);

        // 7. News
        NewsItemEntity news1 = NewsItemEntity.builder()
                .id(UUID.fromString("ffffffff-ffff-4fff-ffff-111111111111"))
                .sourceType(NewsSource.INTERNAL)
                .title("The Grand Palace Reaches 1,800 Rescued Meals Milestone")
                .snippet("The culinary brigade at The Grand Palace Hotel celebrated diverting over 1.8 tons of wholesome surplus banquet meals.")
                .sourceName("FoodRescue Impact Desk")
                .status(NewsStatus.PUBLISHED)
                .pinned(true)
                .publishedAt(now.minus(2, ChronoUnit.DAYS))
                .build();
        newsItemRepository.save(news1);

        log.info("FoodRescue demo entities successfully seeded!");
    }
}
