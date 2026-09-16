package com.paradiseresort.backend.controller;

import com.paradiseresort.backend.dto.BookingResponse;
import com.paradiseresort.backend.dto.CheckInRequest;
import com.paradiseresort.backend.service.CheckInService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employee/check-in")
public class EmployeeCheckInController {

    private final CheckInService checkInService;

    public EmployeeCheckInController(CheckInService checkInService) {
        this.checkInService = checkInService;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> checkIn(
            @Valid @RequestBody CheckInRequest request
    ) {
        BookingResponse booking = checkInService.checkIn(request.bookingId());

        return ResponseEntity.ok(
                booking
        );
    }
}
