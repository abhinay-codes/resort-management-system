package com.paradiseresort.backend.dto;

import jakarta.validation.constraints.NotNull;

public record CheckInRequest(

        @NotNull(message = "Booking ID is required.")
        Long bookingId

) {
}