package com.paradiseresort.backend.dto;

import com.paradiseresort.backend.entity.Booking;
import com.paradiseresort.backend.entity.BookingStatus;

import java.time.LocalDate;
import java.util.List;

public record GuestResponse(
        String name,
        String email,
        String phone,
        int totalBookings,
        List<BookingSummary> bookings
) {

    public record BookingSummary(
            Long bookingId,
            Long roomId,
            String roomName,
            LocalDate checkIn,
            LocalDate checkOut,
            int guests,
            BookingStatus status
    ) {

        public static BookingSummary fromEntity(Booking booking) {
            return new BookingSummary(
                    booking.getId(),
                    booking.getRoom().getId(),
                    booking.getRoom().getName(),
                    booking.getCheckIn(),
                    booking.getCheckOut(),
                    booking.getGuests(),
                    booking.getStatus()
            );
        }
    }
}