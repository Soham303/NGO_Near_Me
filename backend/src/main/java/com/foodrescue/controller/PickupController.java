package com.foodrescue.controller;

import com.foodrescue.dto.*;
import com.foodrescue.service.PickupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pickups")
@RequiredArgsConstructor
public class PickupController {

    private final PickupService pickupService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PickupResponse>>> getPickups() {
        List<PickupResponse> pickups = pickupService.getAllPickups();
        return ResponseEntity.ok(ApiResponse.ok(pickups));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PickupResponse>> getPickupById(@PathVariable("id") UUID id) {
        PickupResponse pickup = pickupService.getPickupById(id);
        if (pickup == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.ok(pickup));
    }

    @PostMapping("/claim")
    public ResponseEntity<ApiResponse<PickupResponse>> claimListing(
            @Valid @RequestBody ClaimListingRequest request) {
        PickupResponse response = pickupService.claimListing(request);
        return ResponseEntity.ok(ApiResponse.ok("Listing claimed successfully", response));
    }

    @PostMapping("/{id}/release")
    public ResponseEntity<ApiResponse<Void>> releaseClaim(@PathVariable("id") UUID id) {
        boolean released = pickupService.releaseClaim(id);
        if (!released) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to release claim"));
        }
        return ResponseEntity.ok(ApiResponse.ok("Claim released successfully", null));
    }

    @PostMapping("/{id}/start-trip")
    public ResponseEntity<ApiResponse<Void>> startTrip(@PathVariable("id") UUID id) {
        pickupService.startTrip(id);
        return ResponseEntity.ok(ApiResponse.ok("Trip started successfully", null));
    }

    @PostMapping("/{id}/location")
    public ResponseEntity<ApiResponse<Void>> updateLocation(
            @PathVariable("id") UUID id,
            @Valid @RequestBody LocationUpdateRequest request) {
        pickupService.updateLocation(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Location updated", null));
    }

    @PostMapping("/{id}/handoff")
    public ResponseEntity<ApiResponse<Void>> recordHandoff(
            @PathVariable("id") UUID id,
            @RequestParam(value = "inGeofence", defaultValue = "true") boolean inGeofence) {
        pickupService.recordHandoff(id, inGeofence);
        return ResponseEntity.ok(ApiResponse.ok("Handoff recorded successfully", null));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<Void>> submitCompletionReport(
            @PathVariable("id") UUID id,
            @Valid @RequestBody CompletionReportRequest request) {
        pickupService.submitCompletionReport(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Completion report submitted successfully", null));
    }

    @PostMapping("/{id}/assign-volunteer")
    public ResponseEntity<ApiResponse<Void>> assignVolunteer(
            @PathVariable("id") UUID id,
            @RequestParam("volunteerId") UUID volunteerId) {
        pickupService.assignVolunteer(id, volunteerId);
        return ResponseEntity.ok(ApiResponse.ok("Volunteer assigned successfully", null));
    }
}
