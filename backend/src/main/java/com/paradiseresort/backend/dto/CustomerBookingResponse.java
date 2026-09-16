package com.paradiseresort.backend.dto;

import com.paradiseresort.backend.entity.Booking;

import java.math.BigDecimal;
import java.time.LocalDate;


/*
 * Public customer-facing representation of a booking.
 *
 * This DTO intentionally exposes only the information
 * a customer needs to view their booking.
 *
 * Sensitive fields such as phone number and
 * special requests are not included.
 */
public record CustomerBookingResponse(

        Long id,

        String guestName,

        LocalDate checkIn,

        LocalDate checkOut,

        int guests,

        BigDecimal totalAmount,

        String status,

        RoomResponse room

) {

    public static CustomerBookingResponse fromEntity(
            Booking booking
    ) {

        return new CustomerBookingResponse(

                booking.getId(),

                booking.getGuestName(),

                booking.getCheckIn(),

                booking.getCheckOut(),

                booking.getGuests(),

                booking.getTotalAmount(),

                booking.getStatus().name(),

                RoomResponse.fromEntity(
                        booking.getRoom()
                )
        );
    }
}