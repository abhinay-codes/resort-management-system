package com.paradiseresort.backend.controller;

import com.paradiseresort.backend.dto.RoomResponse;
import com.paradiseresort.backend.service.BookingService;
import com.paradiseresort.backend.service.RoomService;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;


@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    private final BookingService bookingService;


    public RoomController(
            RoomService roomService,
            BookingService bookingService
    ) {
        this.roomService =
                roomService;

        this.bookingService =
                bookingService;
    }


    /*
     * ==========================================
     * GET ALL ROOMS
     * ==========================================
     */

    @GetMapping
    public List<RoomResponse> getAllRooms() {

        return roomService.getAllRooms();
    }


    /*
     * ==========================================
     * GET ONE ROOM
     * ==========================================
     */

    @GetMapping("/{id}")
    public ResponseEntity<RoomResponse> getRoomById(
            @PathVariable Long id
    ) {

        RoomResponse room =
                roomService.getRoomById(
                        id
                );


        return ResponseEntity.ok(
                room
        );
    }


    /*
     * ==========================================
     * CHECK ROOM AVAILABILITY
     * ==========================================
     *
     * Availability is booking-related business
     * logic, so it remains inside BookingService.
     */

    @GetMapping("/{id}/availability")
    public ResponseEntity<AvailabilityResponse> checkAvailability(
            @PathVariable Long id,

            @RequestParam LocalDate checkIn,

            @RequestParam LocalDate checkOut
    ) {

        boolean available =
                bookingService.isRoomAvailable(
                        id,
                        checkIn,
                        checkOut
                );


        return ResponseEntity.ok(
                new AvailabilityResponse(
                        available
                )
        );
    }


    /*
     * ==========================================
     * AVAILABILITY RESPONSE
     * ==========================================
     */

    public record AvailabilityResponse(
            boolean available
    ) {
    }
}