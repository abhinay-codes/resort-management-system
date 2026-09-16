package com.paradiseresort.backend.controller;

import com.paradiseresort.backend.dto.AssignHousekeepingTaskRequest;
import com.paradiseresort.backend.dto.CreateHousekeepingTaskRequest;
import com.paradiseresort.backend.dto.HousekeepingTaskResponse;
import com.paradiseresort.backend.service.HousekeepingService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/housekeeping")
public class AdminHousekeepingController {

    private final HousekeepingService housekeepingService;

    public AdminHousekeepingController(
            HousekeepingService housekeepingService
    ) {
        this.housekeepingService = housekeepingService;
    }

    /*
     * ==========================================
     * GET ALL HOUSEKEEPING TASKS
     * ==========================================
     */

    @GetMapping
    public List<HousekeepingTaskResponse> getAllTasks() {

        return housekeepingService.getAllTasks();
    }

    /*
     * ==========================================
     * CREATE HOUSEKEEPING TASK
     * ==========================================
     */

    @PostMapping
    public ResponseEntity<HousekeepingTaskResponse> createTask(
            @Valid @RequestBody CreateHousekeepingTaskRequest request
    ) {

        HousekeepingTaskResponse response =
                housekeepingService.createTask(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /*
     * ==========================================
     * REASSIGN TASK
     * ==========================================
     */

    @PutMapping("/{id}/assign")
    public ResponseEntity<HousekeepingTaskResponse> assignTask(
            @PathVariable Long id,
            @Valid @RequestBody AssignHousekeepingTaskRequest request
    ) {

        HousekeepingTaskResponse response =
                housekeepingService.assignTask(
                        id,
                        request
                );

        return ResponseEntity.ok(response);
    }

    /*
     * ==========================================
     * CANCEL TASK
     * ==========================================
     */

    @PutMapping("/{id}/cancel")
    public ResponseEntity<HousekeepingTaskResponse> cancelTask(
            @PathVariable Long id
    ) {

        HousekeepingTaskResponse response =
                housekeepingService.cancelTask(id);

        return ResponseEntity.ok(response);
    }
}