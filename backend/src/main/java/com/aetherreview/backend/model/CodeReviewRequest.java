package com.aetherreview.backend.model;

import jakarta.validation.constraints.NotBlank;

public class CodeReviewRequest {

    @NotBlank(message = "Filename is required")
    private String filename;

    @NotBlank(message = "Code is required")
    private String code;

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
