package com.paradiseresort.backend.controller;

import com.paradiseresort.backend.dto.BookingRequest;
import com.paradiseresort.backend.dto.CustomerBookingResponse;
import com.paradiseresort.backend.service.CustomerBookingService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer/bookings")
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerBookingController {

    private final CustomerBookingService customerBookingService;

    public CustomerBookingController(
            CustomerBookingService customerBookingService
    ) {
        this.customerBookingService =
                customerBookingService;
    }

    /*
     * ==========================================
     * CREATE BOOKING
     * ==========================================
     */

    @PostMapping
    public ResponseEntity<CustomerBookingResponse> createBooking(
            @Valid @RequestBody BookingRequest request,
            Authentication authentication
    ) {

        CustomerBookingResponse response =
                customerBookingService.createBooking(
                        request,
                        authentication.getName()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /*
     * ==========================================
     * GET MY BOOKINGS
     * ==========================================
     */

    @GetMapping
    public ResponseEntity<List<CustomerBookingResponse>> getMyBookings(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                customerBookingService.getMyBookings(
                        authentication.getName()
                )
        );
    }

    /*
     * ==========================================
     * GET MY BOOKING
     * ==========================================
     */

    @GetMapping("/{id}")
    public ResponseEntity<CustomerBookingResponse> getMyBooking(
            @PathVariable Long id,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                customerBookingService.getMyBooking(
                        id,
                        authentication.getName()
                )
        );
    }

    /*
     * ==========================================
     * CANCEL MY BOOKING
     * ==========================================
     */

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<CustomerBookingResponse> cancelMyBooking(
            @PathVariable Long id,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                customerBookingService.cancelMyBooking(
                        id,
                        authentication.getName()
                )
        );
    }
}