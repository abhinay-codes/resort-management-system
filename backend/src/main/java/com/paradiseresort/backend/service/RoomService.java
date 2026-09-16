package com.paradiseresort.backend.service;

import com.paradiseresort.backend.dto.RoomResponse;
import com.paradiseresort.backend.entity.Room;
import com.paradiseresort.backend.entity.RoomStatus;
import com.paradiseresort.backend.repository.RoomRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomStateService roomStateService;

    public RoomService(
            RoomRepository roomRepository,
            RoomStateService roomStateService
    ) {
        this.roomRepository = roomRepository;
        this.roomStateService = roomStateService;
    }

    /*
     * ==========================================
     * GET ALL ROOMS
     * ==========================================
     *
     * Used by:
     *
     * - Public room pages
     * - Booking form
     * - Admin room management
     * - Housekeeping
     * - Maintenance
     *
     * The repository returns Room entities.
     *
     * The service converts them into DTOs before
     * they reach the controller.
     */
    @Transactional(readOnly = true)
    public List<RoomResponse> getAllRooms() {

        return roomRepository
                .findAll()
                .stream()
                .map(RoomResponse::fromEntity)
                .toList();
    }

    /*
     * ==========================================
     * GET ONE ROOM
     * ==========================================
     */
    @Transactional(readOnly = true)
    public RoomResponse getRoomById(
            Long id
    ) {

        if (id == null || id <= 0) {
            throw new IllegalArgumentException(
                    "Room ID must be a positive number."
            );
        }

        Room room =
                roomRepository
                        .findById(id)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Room not found."
                                        )
                        );

        return RoomResponse.fromEntity(room);
    }

    /*
     * ==========================================
     * ADMIN - UPDATE ROOM STATUS
     * ==========================================
     *
     * IMPORTANT:
     *
     * Do NOT directly change room.setStatus(...)
     * here.
     *
     * RoomStateService is the centralized authority
     * for all physical room-state transitions.
     *
     * This keeps this flow compatible with:
     *
     * - Check-in
     * - Check-out
     * - Housekeeping
     * - Maintenance
     *
     * Example:
     *
     * AVAILABLE -> MAINTENANCE
     *
     * will be validated by RoomStateService.
     */
    @Transactional
    public RoomResponse updateRoomStatus(
            Long id,
            RoomStatus status
    ) {

        if (id == null || id <= 0) {
            throw new IllegalArgumentException(
                    "Room ID must be a positive number."
            );
        }

        if (status == null) {
            throw new IllegalArgumentException(
                    "Room status is required."
            );
        }

        Room updatedRoom =
                roomStateService.transition(
                        id,
                        status
                );

        return RoomResponse.fromEntity(
                updatedRoom
        );
    }
}