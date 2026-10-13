package com.foodrescue.controller;

import com.foodrescue.dto.ApiResponse;
import com.foodrescue.entity.VolunteerEntity;
import com.foodrescue.service.MasterDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/volunteers")
@RequiredArgsConstructor
public class VolunteerController {

    private final MasterDataService masterDataService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<VolunteerEntity>>> getVolunteers(
            @RequestParam(value = "ngoId", required = false) UUID ngoId) {
        List<VolunteerEntity> list = (ngoId != null)
                ? masterDataService.getVolunteersByNgo(ngoId)
                : masterDataService.getVolunteers();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }
}
