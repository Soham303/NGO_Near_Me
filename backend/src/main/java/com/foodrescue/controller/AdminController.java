package com.foodrescue.controller;

import com.foodrescue.dto.ApiResponse;
import com.foodrescue.entity.AdminActionEntity;
import com.foodrescue.entity.HotelEntity;
import com.foodrescue.entity.NgoEntity;
import com.foodrescue.entity.enums.OrgStatus;
import com.foodrescue.repository.AdminActionRepository;
import com.foodrescue.repository.HotelRepository;
import com.foodrescue.repository.NgoRepository;
import com.foodrescue.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final HotelRepository hotelRepository;
    private final NgoRepository ngoRepository;
    private final AdminActionRepository adminActionRepository;

    @GetMapping("/actions")
    public ResponseEntity<ApiResponse<List<AdminActionEntity>>> getAdminActions() {
        return ResponseEntity.ok(ApiResponse.ok(adminActionRepository.findAllByOrderByCreatedAtDesc()));
    }

    @PostMapping("/org/{type}/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateOrgStatus(
            @PathVariable("type") String type,
            @PathVariable("id") UUID id,
            @RequestParam("status") OrgStatus status,
            @RequestParam(value = "reason", required = false) String reason,
            @AuthenticationPrincipal UserPrincipal principal) {

        UUID adminId = principal != null ? principal.getId() : UUID.randomUUID();

        if ("hotel".equalsIgnoreCase(type)) {
            HotelEntity hotel = hotelRepository.findById(id).orElse(null);
            if (hotel == null) return ResponseEntity.notFound().build();
            hotel.setStatus(status);
            hotelRepository.save(hotel);
        } else if ("ngo".equalsIgnoreCase(type)) {
            NgoEntity ngo = ngoRepository.findById(id).orElse(null);
            if (ngo == null) return ResponseEntity.notFound().build();
            ngo.setStatus(status);
            ngoRepository.save(ngo);
        }

        // Record audit
        adminActionRepository.save(AdminActionEntity.builder()
                .adminId(adminId)
                .action("UPDATE_STATUS")
                .targetType(type)
                .targetId(id)
                .reason(reason != null ? reason : "Status changed to " + status)
                .build());

        return ResponseEntity.ok(ApiResponse.ok("Status updated successfully", null));
    }
}
