package com.paradiseresort.backend.controller;

import com.paradiseresort.backend.dto.*;
import com.paradiseresort.backend.service.AnalyticsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/analytics")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAnalyticsController {

    private final AnalyticsService analyticsService;

    public AdminAnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    private void validateDateRange(LocalDate from, LocalDate to) {
        if (from != null && to != null && from.isAfter(to)) {
            throw new IllegalArgumentException("'from' date must be before or equal to 'to' date.");
        }
    }

    @GetMapping("/summary")
    public ResponseEntity<AnalyticsSummaryResponse> getSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        validateDateRange(from, to);
        return ResponseEntity.ok(analyticsService.getSummary(from, to));
    }

    @GetMapping("/occupancy")
    public ResponseEntity<OccupancyAnalyticsResponse> getOccupancy(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        validateDateRange(from, to);
        return ResponseEntity.ok(analyticsService.getOccupancy(from, to));
    }

    @GetMapping("/rooms")
    public ResponseEntity<List<RoomPerformanceResponse>> getRoomPerformance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        validateDateRange(from, to);
        return ResponseEntity.ok(analyticsService.getRoomPerformance(from, to));
    }

    @GetMapping("/customers")
    public ResponseEntity<CustomerAnalyticsResponse> getCustomerAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        validateDateRange(from, to);
        return ResponseEntity.ok(analyticsService.getCustomerAnalytics(from, to));
    }

    @GetMapping("/monthly")
    public ResponseEntity<List<MonthlyAnalyticsResponse>> getMonthlyAnalytics(
            @RequestParam int year) {
        if (year < 2000 || year > 2100) {
            throw new IllegalArgumentException("Invalid year");
        }
        return ResponseEntity.ok(analyticsService.getMonthlyAnalytics(year));
    }
}

