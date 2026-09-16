package com.paradiseresort.backend.controller;

import com.paradiseresort.backend.dto.BookingResponse;
import com.paradiseresort.backend.dto.CheckOutRequest;
import com.paradiseresort.backend.service.CheckOutService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employee/check-out")
public class EmployeeCheckOutController {

    private final CheckOutService checkOutService;

    public EmployeeCheckOutController(
            CheckOutService checkOutService
    ) {
        this.checkOutService = checkOutService;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> checkOut(
            @Valid @RequestBody CheckOutRequest request
    ) {
        BookingResponse booking = checkOutService.checkOut(request.bookingId());

        return ResponseEntity.ok(
                booking
        );
    }
}
