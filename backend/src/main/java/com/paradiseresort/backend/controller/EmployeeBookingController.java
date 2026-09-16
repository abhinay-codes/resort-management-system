package com.paradiseresort.backend.controller;

import com.paradiseresort.backend.dto.BookingResponse;
import com.paradiseresort.backend.entity.BookingStatus;
import com.paradiseresort.backend.service.BookingService;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/employee/bookings")
public class EmployeeBookingController {

    private final BookingService bookingService;


    public EmployeeBookingController(
            BookingService bookingService
    ) {

        this.bookingService = bookingService;
    }


    /*
     * ==========================================
     * GET ALL BOOKINGS
     * ==========================================
     */

    @GetMapping
    public List<BookingResponse> getAllBookings() {

        return bookingService.getAllBookings();
    }


    /*
     * ==========================================
     * GET ONE BOOKING
     * ==========================================
     */

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(
            @PathVariable Long id
    ) {

        BookingResponse booking =
                bookingService.getBookingById(
                        id
                );


        return ResponseEntity.ok(
                booking
        );
    }


    /*
     * ==========================================
     * UPDATE BOOKING STATUS
     * ==========================================
     */

    @PutMapping("/{id}/status")
    public ResponseEntity<BookingResponse> updateBookingStatus(
            @PathVariable Long id,

            @RequestParam BookingStatus status
    ) {

        BookingResponse updatedBooking =
                bookingService.updateBookingStatus(
                        id,
                        status
                );


        return ResponseEntity.ok(
                updatedBooking
        );
    }
}