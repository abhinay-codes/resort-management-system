package com.paradiseresort.backend.controller;

import com.paradiseresort.backend.dto.BookingRequest;
import com.paradiseresort.backend.dto.BookingResponse;
import com.paradiseresort.backend.dto.CustomerBookingResponse;
import com.paradiseresort.backend.service.BookingService;
import com.paradiseresort.backend.service.CustomerBookingService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final CustomerBookingService customerBookingService;

    public BookingController(
            BookingService bookingService,
            CustomerBookingService customerBookingService
    ) {
        this.bookingService = bookingService;
        this.customerBookingService = customerBookingService;
    }

    /*
     * ==========================================
     * CREATE BOOKING
     * ==========================================
     */

    @PostMapping
    public ResponseEntity<?> createBooking(
            @Valid @RequestBody BookingRequest request,
            Authentication authentication
    ) {

        if (
                authentication != null
                && authentication.isAuthenticated()
                && authentication.getAuthorities()
                        .stream()
                        .anyMatch(
                                authority ->
                                        authority
                                                .getAuthority()
                                                .equals("ROLE_CUSTOMER")
                        )
        ) {

            CustomerBookingResponse booking =
                    customerBookingService.createBooking(
                            request,
                            authentication.getName()
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(booking);
        }

        BookingResponse booking =
                bookingService.createBooking(
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(booking);
    }

    /*
     * ==========================================
     * GUEST BOOKING LOOKUP
     * ==========================================
     *
     * Allows a guest/customer to retrieve a
     * booking using:
     *
     * booking ID + guest email
     *
     * Ownership is verified inside the service.
     */

    @GetMapping("/{id}")
    public ResponseEntity<CustomerBookingResponse> getBookingByGuestEmail(
            @PathVariable Long id,
            @RequestParam String email
    ) {

        CustomerBookingResponse booking =
                customerBookingService.getBookingByGuestEmail(
                        id,
                        email
                );

        return ResponseEntity.ok(
                booking
        );
    }
}