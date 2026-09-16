package com.paradiseresort.backend.service;

import com.paradiseresort.backend.dto.BookingResponse;
import com.paradiseresort.backend.entity.Booking;
import com.paradiseresort.backend.entity.BookingStatus;
import com.paradiseresort.backend.entity.Room;
import com.paradiseresort.backend.entity.RoomStatus;
import com.paradiseresort.backend.repository.BookingRepository;
import com.paradiseresort.backend.repository.RoomRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class CheckInService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final RoomStateService roomStateService;

    public CheckInService(
            BookingRepository bookingRepository,
            RoomRepository roomRepository,
            RoomStateService roomStateService
    ) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.roomStateService = roomStateService;
    }

    @Transactional
    public BookingResponse checkIn(Long bookingId) {

        if (bookingId == null || bookingId <= 0) {
            throw new IllegalArgumentException(
                    "Booking ID must be a positive number."
            );
        }

        Booking booking =
                bookingRepository.findByIdForUpdate(bookingId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Booking not found."
                                )
                        );

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new IllegalStateException(
                    "Only confirmed bookings can be checked in."
            );
        }

        LocalDate today = LocalDate.now();

        if (today.isBefore(booking.getCheckIn())) {
            throw new IllegalStateException(
                    "Check-in is not allowed before the booking check-in date."
            );
        }

        if (!today.isBefore(booking.getCheckOut())) {
            throw new IllegalStateException(
                    "Check-in is not allowed on or after the check-out date."
            );
        }

        Long roomId = booking.getRoom().getId();

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Room not found."
                        )
                );

        if (room.getStatus() != RoomStatus.AVAILABLE) {
            throw new IllegalStateException(
                    "Room is not available for check-in. Current status: "
                            + room.getStatus()
            );
        }

        /*
         * Centralized room state transition:
         *
         * AVAILABLE → OCCUPIED
         */
        roomStateService.transition(
                roomId,
                RoomStatus.OCCUPIED
        );

        booking.setStatus(
                BookingStatus.CHECKED_IN
        );

        return BookingResponse.fromEntity(
                bookingRepository.save(booking)
        );
    }
}