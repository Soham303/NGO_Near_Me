package com.foodrescue.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CompletionReportRequest {
    @NotNull
    @Min(0)
    private Integer portionsReceived;

    @Min(0)
    private Integer leftBehind = 0;

    private String photoUrl;
    private List<String> tags;
}
