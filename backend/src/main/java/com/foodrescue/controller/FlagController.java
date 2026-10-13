package com.foodrescue.controller;

import com.foodrescue.dto.ApiResponse;
import com.foodrescue.entity.FlagEntity;
import com.foodrescue.entity.enums.FlagStatus;
import com.foodrescue.repository.FlagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/flags")
@RequiredArgsConstructor
public class FlagController {

    private final FlagRepository flagRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FlagEntity>>> getFlags() {
        return ResponseEntity.ok(ApiResponse.ok(flagRepository.findAllByOrderByCreatedAtDesc()));
    }

    @PostMapping("/{id}/resolve")
    public ResponseEntity<ApiResponse<Void>> resolveFlag(
            @PathVariable("id") UUID id,
            @RequestParam("status") FlagStatus status) {
        FlagEntity flag = flagRepository.findById(id).orElse(null);
        if (flag == null) return ResponseEntity.notFound().build();

        flag.setStatus(status);
        flag.setResolvedAt(Instant.now());
        flagRepository.save(flag);

        return ResponseEntity.ok(ApiResponse.ok("Flag resolved successfully", null));
    }
}
