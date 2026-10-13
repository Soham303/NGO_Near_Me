package com.foodrescue.controller;

import com.foodrescue.dto.ApiResponse;
import com.foodrescue.entity.NewsItemEntity;
import com.foodrescue.entity.enums.NewsStatus;
import com.foodrescue.repository.NewsItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
public class NewsController {

    private final NewsItemRepository newsItemRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NewsItemEntity>>> getNews() {
        return ResponseEntity.ok(ApiResponse.ok(
                newsItemRepository.findByStatusOrderByPinnedDescPublishedAtDesc(NewsStatus.PUBLISHED)
        ));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<NewsItemEntity>> createNews(@RequestBody NewsItemEntity newsItem) {
        NewsItemEntity created = newsItemRepository.save(newsItem);
        return ResponseEntity.ok(ApiResponse.ok("News item created", created));
    }

    @PostMapping("/{id}/pin")
    public ResponseEntity<ApiResponse<Void>> togglePin(@PathVariable("id") UUID id) {
        NewsItemEntity item = newsItemRepository.findById(id).orElse(null);
        if (item == null) return ResponseEntity.notFound().build();

        item.setPinned(!item.getPinned());
        newsItemRepository.save(item);
        return ResponseEntity.ok(ApiResponse.ok("Pin status updated", null));
    }
}
