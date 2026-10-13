package com.foodrescue.controller;

import com.foodrescue.dto.ApiResponse;
import com.foodrescue.entity.HotelEntity;
import com.foodrescue.service.MasterDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
public class HotelController {

    private final MasterDataService masterDataService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<HotelEntity>>> getHotels() {
        return ResponseEntity.ok(ApiResponse.ok(masterDataService.getHotels()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HotelEntity>> getHotelById(@PathVariable("id") UUID id) {
        HotelEntity hotel = masterDataService.getHotelById(id);
        if (hotel == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(ApiResponse.ok(hotel));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<HotelEntity>> getHotelBySlug(@PathVariable("slug") String slug) {
        HotelEntity hotel = masterDataService.getHotelBySlug(slug);
        if (hotel == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(ApiResponse.ok(hotel));
    }
}
