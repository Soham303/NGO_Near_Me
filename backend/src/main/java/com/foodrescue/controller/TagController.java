package com.foodrescue.controller;

import com.foodrescue.dto.ApiResponse;
import com.foodrescue.entity.TagEntity;
import com.foodrescue.service.MasterDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final MasterDataService masterDataService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TagEntity>>> getTags() {
        return ResponseEntity.ok(ApiResponse.ok(masterDataService.getTags()));
    }
}
