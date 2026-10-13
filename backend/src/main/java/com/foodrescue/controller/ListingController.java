package com.foodrescue.controller;

import com.foodrescue.dto.ApiResponse;
import com.foodrescue.dto.CreateListingRequest;
import com.foodrescue.dto.ListingResponse;
import com.foodrescue.entity.enums.ListingStatus;
import com.foodrescue.service.ListingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
public class ListingController {

    private final ListingService listingService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ListingResponse>>> getListings(
            @RequestParam(value = "status", required = false) ListingStatus status) {
        List<ListingResponse> listings = listingService.getAllListings(status);
        return ResponseEntity.ok(ApiResponse.ok(listings));
    }

    @GetMapping("/nearby")
    public ResponseEntity<ApiResponse<List<ListingResponse>>> getNearbyListings(
            @RequestParam("lat") double lat,
            @RequestParam("lng") double lng,
            @RequestParam(value = "radiusKm", defaultValue = "10.0") double radiusKm) {
        List<ListingResponse> listings = listingService.getNearbyListings(lat, lng, radiusKm);
        return ResponseEntity.ok(ApiResponse.ok(listings));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ListingResponse>> getListingById(@PathVariable("id") UUID id) {
        ListingResponse listing = listingService.getListingById(id);
        if (listing == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.ok(listing));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ListingResponse>> createListing(
            @Valid @RequestBody CreateListingRequest request) {
        ListingResponse created = listingService.createListing(request);
        return ResponseEntity.ok(ApiResponse.ok("Listing posted successfully", created));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelListing(@PathVariable("id") UUID id) {
        boolean cancelled = listingService.cancelListing(id);
        if (!cancelled) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to cancel listing"));
        }
        return ResponseEntity.ok(ApiResponse.ok("Listing cancelled successfully", null));
    }
}
