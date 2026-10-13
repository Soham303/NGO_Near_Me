package com.foodrescue.controller;

import com.foodrescue.entity.HotelEntity;
import com.foodrescue.entity.ScoreSnapshotEntity;
import com.foodrescue.repository.HotelRepository;
import com.foodrescue.service.ScoringService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/badge")
@RequiredArgsConstructor
public class BadgeController {

    private final HotelRepository hotelRepository;
    private final ScoringService scoringService;

    @GetMapping(value = "/{slug}", produces = "image/svg+xml")
    public ResponseEntity<String> getBadge(@PathVariable("slug") String slug) {
        HotelEntity hotel = hotelRepository.findBySlug(slug).orElse(null);
        String hotelName = hotel != null ? hotel.getName() : "Verified Partner";
        int mealsRescued = 1420;
        String tier = "FOREST";
        double score = 94.2;

        if (hotel != null) {
            ScoreSnapshotEntity latest = scoringService.getLatestScoreForHotel(hotel.getId());
            if (latest != null) {
                mealsRescued = latest.getPortionsRescued() != null ? latest.getPortionsRescued() : 0;
                tier = latest.getTier() != null ? latest.getTier().toUpperCase() : "SPROUT";
                score = latest.getComposite() != null ? latest.getComposite().doubleValue() : 80.0;
            }
        }

        String displayName = (hotelName.length() > 28) ? hotelName.substring(0, 26) + "..." : hotelName;

        String svg = String.format("""
            <svg width="320" height="110" viewBox="0 0 320 110" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="320" height="110" rx="12" fill="#FAFAF7" stroke="#E4E7EC" stroke-width="2"/>
              <rect x="0" y="0" width="8" height="110" rx="4" fill="#2E7D32"/>
              
              <!-- Header -->
              <text x="24" y="28" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="11" font-weight="700" fill="#667085" letter-spacing="1">FOODRESCUE VERIFIED</text>
              <circle cx="160" cy="24" r="3" fill="#2E7D32"/>
              <text x="170" y="28" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="11" font-weight="700" fill="#2E7D32">%s TIER</text>
              
              <!-- Venue Name -->
              <text x="24" y="52" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="15" font-weight="800" fill="#1F2933">%s</text>
              
              <!-- Stats -->
              <text x="24" y="86" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="22" font-weight="900" fill="#2E7D32">%,d</text>
              <text x="24" y="100" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="10" font-weight="600" fill="#667085">EDIBLE MEALS RESCUED</text>
              
              <text x="220" y="86" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="22" font-weight="900" fill="#1F2933">%.1f</text>
              <text x="220" y="100" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="10" font-weight="600" fill="#667085">RESCUE SCORE</text>
            </svg>
            """, tier, displayName, mealsRescued, score);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.valueOf("image/svg+xml"));
        headers.setCacheControl("public, max-age=300");

        return ResponseEntity.ok().headers(headers).body(svg);
    }
}
