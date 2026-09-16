package com.paradiseresort.backend.controller;

import com.paradiseresort.backend.dto.RoomResponse;
import com.paradiseresort.backend.entity.Room;
import com.paradiseresort.backend.entity.RoomStatus;
import com.paradiseresort.backend.service.RoomStateService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/room-state")
public class AdminRoomStateController {

    private final RoomStateService roomStateService;

    public AdminRoomStateController(
            RoomStateService roomStateService
    ) {
        this.roomStateService = roomStateService;
    }

    @PutMapping("/{roomId}")
    public ResponseEntity<RoomResponse> updateRoomState(
            @PathVariable Long roomId,
            @RequestParam RoomStatus status
    ) {

        Room room = roomStateService.transition(
                roomId,
                status
        );

        return ResponseEntity.ok(
                RoomResponse.fromEntity(room)
        );
    }
}