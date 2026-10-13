package com.foodrescue.controller;

import com.foodrescue.dto.ApiResponse;
import com.foodrescue.dto.SignUpRequest;
import com.foodrescue.dto.UserProfileResponse;
import com.foodrescue.security.UserPrincipal;
import com.foodrescue.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(value = "userId", required = false) UUID userIdParam) {

        UUID targetUserId = userIdParam != null ? userIdParam : (principal != null ? principal.getId() : null);
        if (targetUserId == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("User ID not provided or unauthenticated"));
        }

        UserProfileResponse response = authService.getCurrentUserProfile(targetUserId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/register-sync")
    public ResponseEntity<ApiResponse<UserProfileResponse>> registerOrSync(
            @Valid @RequestBody SignUpRequest request) {

        UserProfileResponse response = authService.registerUser(request);
        return ResponseEntity.ok(ApiResponse.ok("User profile synced successfully", response));
    }

    @GetMapping("/session")
    public ResponseEntity<ApiResponse<UserPrincipal>> getSession(
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.ok(ApiResponse.error("No active session"));
        }
        return ResponseEntity.ok(ApiResponse.ok(principal));
    }
}
