package com.paradiseresort.backend.dto;

import com.paradiseresort.backend.entity.Room;
import com.paradiseresort.backend.entity.RoomStatus;

import java.math.BigDecimal;

public record RoomResponse(
        Long id,
        String name,
        String description,
        BigDecimal price,
        int guests,
        String image,
        RoomStatus status
) {

    public static RoomResponse fromEntity(Room room) {

        return new RoomResponse(
                room.getId(),
                room.getName(),
                room.getDescription(),
                room.getPrice(),
                room.getGuests(),
                room.getImage(),
                room.getStatus()
        );
    }
}