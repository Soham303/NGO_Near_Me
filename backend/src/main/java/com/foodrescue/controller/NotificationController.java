package com.foodrescue.controller;

import com.foodrescue.dto.ApiResponse;
import com.foodrescue.entity.NotificationEntity;
import com.foodrescue.repository.NotificationRepository;
import com.foodrescue.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationEntity>>> getNotifications(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(value = "userId", required = false) UUID userIdParam) {
        UUID userId = userIdParam != null ? userIdParam : (principal != null ? principal.getId() : null);
        if (userId == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("User ID required"));
        }
        return ResponseEntity.ok(ApiResponse.ok(notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable("id") UUID id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
        return ResponseEntity.ok(ApiResponse.ok("Notification marked as read", null));
    }
}
