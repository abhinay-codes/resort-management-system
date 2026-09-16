package com.paradiseresort.backend.controller;

import com.paradiseresort.backend.dto.UpdateRoomMaintenanceRequest;
import com.paradiseresort.backend.entity.Room;
import com.paradiseresort.backend.service.MaintenanceService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/maintenance")
public class AdminMaintenanceController {

    private final MaintenanceService maintenanceService;

    public AdminMaintenanceController(
            MaintenanceService maintenanceService
    ) {
        this.maintenanceService = maintenanceService;
    }

    /*
     * ==========================================
     * GET MAINTENANCE ROOMS
     * ==========================================
     */

    @GetMapping
    public ResponseEntity<List<Room>> getMaintenanceRooms() {

        return ResponseEntity.ok(
                maintenanceService.getMaintenanceRooms()
        );
    }

    /*
     * ==========================================
     * REPORT MAINTENANCE
     * ==========================================
     */

    @PostMapping("/{roomId}")
    public ResponseEntity<Room> reportMaintenance(
            @PathVariable Long roomId,
            @Valid @RequestBody UpdateRoomMaintenanceRequest request
    ) {

        return ResponseEntity.ok(
                maintenanceService.reportMaintenance(
                        roomId,
                        request
                )
        );
    }

    /*
     * ==========================================
     * RESOLVE MAINTENANCE
     * ==========================================
     */

    @PutMapping("/{roomId}/resolve")
    public ResponseEntity<Room> resolveMaintenance(
            @PathVariable Long roomId
    ) {

        return ResponseEntity.ok(
                maintenanceService.resolveMaintenance(roomId)
        );
    }
}