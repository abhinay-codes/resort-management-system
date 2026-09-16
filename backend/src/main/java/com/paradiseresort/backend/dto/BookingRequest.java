package com.paradiseresort.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record BookingRequest(

        @NotBlank
        String guestName,

        @NotBlank
        @Email
        String email,

        @NotBlank
        String phone,

        String specialRequest,

        @NotNull
        @Future
        LocalDate checkIn,

        @NotNull
        @Future
        LocalDate checkOut,

        @Min(1)
        int guests,

        @NotNull
        Long roomId
) {
}