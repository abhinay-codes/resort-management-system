package com.paradiseresort.backend.dto;

import com.paradiseresort.backend.entity.Booking;

import java.math.BigDecimal;
import java.time.LocalDate;


/*
 * API representation of a Booking.
 *
 * This class controls exactly what information
 * the frontend receives.
 */
public record BookingResponse(

        Long id,

        String guestName,

        String email,

        String phone,

        String specialRequest,

        LocalDate checkIn,

        LocalDate checkOut,

        int guests,

        BigDecimal totalAmount,

        String status,

        RoomResponse room

) {

    /*
     * Convert a Booking JPA entity into
     * a BookingResponse DTO.
     */
    public static BookingResponse fromEntity(
            Booking booking
    ) {

        return new BookingResponse(

                booking.getId(),

                booking.getGuestName(),

                booking.getEmail(),

                booking.getPhone(),

                booking.getSpecialRequest(),

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