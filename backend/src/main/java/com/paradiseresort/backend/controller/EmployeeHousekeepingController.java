package com.paradiseresort.backend.controller;

import com.paradiseresort.backend.dto.HousekeepingTaskResponse;
import com.paradiseresort.backend.entity.HousekeepingStatus;
import com.paradiseresort.backend.service.HousekeepingService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employee/housekeeping")
public class EmployeeHousekeepingController {

    private final HousekeepingService housekeepingService;

    public EmployeeHousekeepingController(
            HousekeepingService housekeepingService
    ) {
        this.housekeepingService = housekeepingService;
    }

    /*
     * ==========================================
     * GET MY HOUSEKEEPING TASKS
     * ==========================================
     */

    @GetMapping
    public List<HousekeepingTaskResponse> getMyTasks() {

        return housekeepingService.getMyTasks();
    }

    /*
     * ==========================================
     * UPDATE MY TASK STATUS
     * ==========================================
     */

    @PutMapping("/{id}/status")
    public ResponseEntity<HousekeepingTaskResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam HousekeepingStatus status
    ) {

        HousekeepingTaskResponse response =
                housekeepingService.updateMyTaskStatus(
                        id,
                        status
                );

        return ResponseEntity.ok(response);
    }
}