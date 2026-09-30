package com.aetherreview.backend.service;

import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.aetherreview.backend.model.CodeReviewRequest;
import com.aetherreview.backend.model.FixRequest;

@Service
public class ReviewService {

    private final RestClient restClient;

    public ReviewService() {
        this.restClient = RestClient.builder()
                .baseUrl("http://127.0.0.1:8000")
                .build();
    }

    public Map<String, Object> reviewCode(CodeReviewRequest request) {

        return restClient.post()
                .uri("/review")
                .body(request)
                .retrieve()
                .body(Map.class);
    }

    public Map<String, Object> fixCode(FixRequest request) {

        return restClient.post()
                .uri("/fix")
                .body(request)
                .retrieve()
                .body(Map.class);
    }
}