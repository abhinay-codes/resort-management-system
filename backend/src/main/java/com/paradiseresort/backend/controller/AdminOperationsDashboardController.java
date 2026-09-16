package com.paradiseresort.backend.controller;

import com.paradiseresort.backend.dto.OperationsDashboardResponse;
import com.paradiseresort.backend.service.OperationsDashboardService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminOperationsDashboardController {

    private final OperationsDashboardService dashboardService;

    public AdminOperationsDashboardController(
            OperationsDashboardService dashboardService
    ) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<OperationsDashboardResponse> getDashboard() {

        return ResponseEntity.ok(
                dashboardService.getDashboard()
        );
    }
}