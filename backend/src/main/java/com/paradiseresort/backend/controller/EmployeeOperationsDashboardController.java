package com.paradiseresort.backend.controller;

import com.paradiseresort.backend.dto.OperationsDashboardResponse;
import com.paradiseresort.backend.service.OperationsDashboardService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employee/dashboard")
public class EmployeeOperationsDashboardController {

    private final OperationsDashboardService operationsDashboardService;

    public EmployeeOperationsDashboardController(
            OperationsDashboardService operationsDashboardService
    ) {
        this.operationsDashboardService =
                operationsDashboardService;
    }

    @GetMapping
    public ResponseEntity<OperationsDashboardResponse> getDashboard() {

        return ResponseEntity.ok(
                operationsDashboardService.getDashboard()
        );
    }
}