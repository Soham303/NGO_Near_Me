package com.foodrescue.controller;

import com.foodrescue.dto.ApiResponse;
import com.foodrescue.entity.FollowEntity;
import com.foodrescue.entity.FollowId;
import com.foodrescue.entity.KudosEntity;
import com.foodrescue.repository.FollowRepository;
import com.foodrescue.repository.KudosRepository;
import com.foodrescue.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.UUID;

@RestController
@RequestMapping("/api/social")
@RequiredArgsConstructor
public class SocialController {

    private final FollowRepository followRepository;
    private final KudosRepository kudosRepository;

    @PostMapping("/follow/{hotelId}")
    public ResponseEntity<ApiResponse<Boolean>> toggleFollow(
            @PathVariable("hotelId") UUID hotelId,
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal != null ? principal.getId() : UUID.randomUUID();
        boolean exists = followRepository.existsByIdUserIdAndIdHotelId(userId, hotelId);

        if (exists) {
            followRepository.deleteByIdUserIdAndIdHotelId(userId, hotelId);
            return ResponseEntity.ok(ApiResponse.ok("Unfollowed hotel", false));
        } else {
            followRepository.save(new FollowEntity(new FollowId(userId, hotelId), null));
            return ResponseEntity.ok(ApiResponse.ok("Followed hotel", true));
        }
    }

    @PostMapping("/kudos/{hotelId}")
    public ResponseEntity<ApiResponse<Void>> sendKudos(
            @PathVariable("hotelId") UUID hotelId,
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal != null ? principal.getId() : UUID.randomUUID();
        LocalDate weekStart = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

        boolean alreadyGiven = kudosRepository.existsByUserIdAndHotelIdAndWeekStart(userId, hotelId, weekStart);
        if (alreadyGiven) {
            return ResponseEntity.badRequest().body(ApiResponse.error("You have already sent kudos to this hotel this week!"));
        }

        kudosRepository.save(KudosEntity.builder()
                .userId(userId)
                .hotelId(hotelId)
                .weekStart(weekStart)
                .build());

        return ResponseEntity.ok(ApiResponse.ok("Kudos sent successfully!", null));
    }
}
