package com.paradiseresort.backend.dto;

import jakarta.validation.constraints.NotNull;

public record CheckOutRequest(

        @NotNull(message = "Booking ID is required.")
        Long bookingId

) {
}