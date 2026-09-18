package com.paradiseresort.backend.service;

import com.paradiseresort.backend.entity.Room;
import com.paradiseresort.backend.entity.RoomStatus;
import com.paradiseresort.backend.repository.RoomRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RoomStateService {

    private final RoomRepository roomRepository;

    public RoomStateService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    @Transactional
    public Room transition(
            Long roomId,
            RoomStatus targetStatus
    ) {

        if (roomId == null || roomId <= 0) {
            throw new IllegalArgumentException(
                    "Room ID must be a positive number."
            );
        }

        if (targetStatus == null) {
            throw new IllegalArgumentException(
                    "Target room status is required."
            );
        }

        Room room =
                roomRepository.findByIdForUpdate(roomId)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Room not found."
                                )
                        );

        RoomStatus currentStatus =
                room.getStatus();

        /*
         * No transition is necessary
         * when the room is already in
         * the requested state.
         */
        if (currentStatus == targetStatus) {
            return room;
        }

        validateTransition(
                currentStatus,
                targetStatus
        );

        room.setStatus(targetStatus);

        return roomRepository.save(room);
    }

    private void validateTransition(
            RoomStatus currentStatus,
            RoomStatus targetStatus
    ) {

        boolean allowed = switch (currentStatus) {

            /*
             * AVAILABLE
             *
             * Normal room operations:
             *
             * AVAILABLE -> OCCUPIED
             *     Guest checks in.
             *
             * AVAILABLE -> CLEANING
             *     Housekeeping is required.
             *
             * AVAILABLE -> MAINTENANCE
             *     Maintenance is required.
             */
            case AVAILABLE ->
                    targetStatus == RoomStatus.OCCUPIED
                    || targetStatus == RoomStatus.CLEANING
                    || targetStatus == RoomStatus.MAINTENANCE;

            /*
             * BOOKED
             *
             * Legacy state retained for now.
             */
            case BOOKED ->
                    targetStatus == RoomStatus.AVAILABLE
                    || targetStatus == RoomStatus.OCCUPIED;

            /*
             * OCCUPIED
             *
             * Guest checks out:
             *
             * OCCUPIED -> CLEANING
             */
            case OCCUPIED ->
                    targetStatus == RoomStatus.CLEANING;

            /*
             * CLEANING
             *
             * Housekeeping finishes:
             *
             * CLEANING -> AVAILABLE
             *
             * Or maintenance is discovered:
             *
             * CLEANING -> MAINTENANCE
             */
            case CLEANING ->
                    targetStatus == RoomStatus.AVAILABLE
                    || targetStatus == RoomStatus.MAINTENANCE;

            /*
             * MAINTENANCE
             *
             * Maintenance resolved:
             *
             * MAINTENANCE -> AVAILABLE
             *
             * Maintenance resolved but needs housekeeping:
             *
             * MAINTENANCE -> CLEANING
             */
            case MAINTENANCE ->
                    targetStatus == RoomStatus.AVAILABLE
                    || targetStatus == RoomStatus.CLEANING;
        };

        if (!allowed) {
            throw new IllegalStateException(
                    "Invalid room status transition: "
                            + currentStatus
                            + " -> "
                            + targetStatus
            );
        }
    }
}