package com.paradiseresort.backend.service;

import com.paradiseresort.backend.dto.UpdateRoomMaintenanceRequest;
import com.paradiseresort.backend.entity.Room;
import com.paradiseresort.backend.entity.RoomStatus;
import com.paradiseresort.backend.repository.RoomRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MaintenanceService {

    private final RoomRepository roomRepository;
    private final RoomStateService roomStateService;

    public MaintenanceService(
            RoomRepository roomRepository,
            RoomStateService roomStateService
    ) {
        this.roomRepository = roomRepository;
        this.roomStateService = roomStateService;
    }

    /*
     * ==========================================
     * ADMIN - GET MAINTENANCE ROOMS
     * ==========================================
     */

    @Transactional(readOnly = true)
    public List<Room> getMaintenanceRooms() {

        return roomRepository
                .findAll()
                .stream()
                .filter(room ->
                        room.getStatus() == RoomStatus.MAINTENANCE
                )
                .toList();
    }

    /*
     * ==========================================
     * REPORT MAINTENANCE
     * ==========================================
     */

    @Transactional
    public Room reportMaintenance(
            Long roomId,
            UpdateRoomMaintenanceRequest request
    ) {

        validateId(roomId);

        if (request == null) {
            throw new IllegalArgumentException(
                    "Maintenance request is required."
            );
        }

        if (
                request.note() == null
                || request.note().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Maintenance note is required."
            );
        }

        Room room =
                roomRepository.findById(roomId)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Room not found."
                                )
                        );

        if (room.getStatus() == RoomStatus.OCCUPIED) {
            throw new IllegalStateException(
                    "Occupied rooms cannot be placed into maintenance."
            );
        }

        if (room.getStatus() == RoomStatus.CLEANING) {
            throw new IllegalStateException(
                    "A room currently being cleaned cannot be placed into maintenance."
            );
        }

        if (room.getStatus() == RoomStatus.MAINTENANCE) {
            return room;
        }

        return roomStateService.transition(
                roomId,
                RoomStatus.MAINTENANCE
        );
    }

    /*
     * ==========================================
     * RESOLVE MAINTENANCE
     * ==========================================
     */

    @Transactional
    public Room resolveMaintenance(
            Long roomId
    ) {

        validateId(roomId);

        Room room =
                roomRepository.findById(roomId)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Room not found."
                                )
                        );

        if (room.getStatus() != RoomStatus.MAINTENANCE) {
            throw new IllegalStateException(
                    "Room is not currently under maintenance."
            );
        }

        return roomStateService.transition(
                roomId,
                RoomStatus.AVAILABLE
        );
    }

    /*
     * ==========================================
     * VALIDATION
     * ==========================================
     */

    private void validateId(Long roomId) {

        if (roomId == null || roomId <= 0) {
            throw new IllegalArgumentException(
                    "Room ID must be a positive number."
            );
        }
    }
}