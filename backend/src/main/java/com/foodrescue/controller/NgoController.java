package com.foodrescue.controller;

import com.foodrescue.dto.ApiResponse;
import com.foodrescue.entity.NgoEntity;
import com.foodrescue.service.MasterDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/ngos")
@RequiredArgsConstructor
public class NgoController {

    private final MasterDataService masterDataService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NgoEntity>>> getNgos() {
        return ResponseEntity.ok(ApiResponse.ok(masterDataService.getNgos()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NgoEntity>> getNgoById(@PathVariable("id") UUID id) {
        NgoEntity ngo = masterDataService.getNgoById(id);
        if (ngo == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(ApiResponse.ok(ngo));
    }
}
