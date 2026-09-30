package com.aetherreview.backend.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aetherreview.backend.model.FixRequest;
import com.aetherreview.backend.service.ReviewService;

@RestController
@RequestMapping("/api")
public class FixController {

    private final ReviewService reviewService;

    public FixController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/fix")
    public Map<String, Object> fixCode(
            @RequestBody FixRequest request) {

        return reviewService.fixCode(request);
    }
}