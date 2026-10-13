package com.foodrescue.controller;

import com.foodrescue.dto.ApiResponse;
import com.foodrescue.entity.ScoreSnapshotEntity;
import com.foodrescue.service.ScoringService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/scores")
@RequiredArgsConstructor
public class ScoreController {

    private final ScoringService scoringService;

    @GetMapping("/leaderboard")
    public ResponseEntity<ApiResponse<List<ScoreSnapshotEntity>>> getLeaderboard() {
        List<ScoreSnapshotEntity> board = scoringService.getLeaderboard();
        return ResponseEntity.ok(ApiResponse.ok(board));
    }

    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<ApiResponse<List<ScoreSnapshotEntity>>> getHotelScores(@PathVariable("hotelId") UUID hotelId) {
        List<ScoreSnapshotEntity> scores = scoringService.getHotelScores(hotelId);
        return ResponseEntity.ok(ApiResponse.ok(scores));
    }

    @PostMapping("/recompute/{hotelId}")
    public ResponseEntity<ApiResponse<ScoreSnapshotEntity>> recomputeScore(@PathVariable("hotelId") UUID hotelId) {
        ScoreSnapshotEntity score = scoringService.recomputeScoreForHotel(hotelId);
        return ResponseEntity.ok(ApiResponse.ok("Score snapshot recomputed", score));
    }
}
