package com.paradiseresort.backend.service;

import com.paradiseresort.backend.dto.GuestResponse;
import com.paradiseresort.backend.entity.Booking;
import com.paradiseresort.backend.repository.BookingRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class GuestService {

    private final BookingRepository bookingRepository;

    public GuestService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @Transactional(readOnly = true)
    public GuestResponse getGuestByEmail(String email) {

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Guest email is required.");
        }

        String normalizedEmail = email.trim();

        List<Booking> bookings =
                bookingRepository.findAllByEmailIgnoreCaseOrderByCheckInDesc(normalizedEmail);

        if (bookings.isEmpty()) {
            throw new IllegalArgumentException("Guest not found.");
        }

        Booking firstBooking = bookings.get(0);

        List<GuestResponse.BookingSummary> bookingSummaries =
                bookings.stream()
                        .map(GuestResponse.BookingSummary::fromEntity)
                        .toList();

        return new GuestResponse(
                firstBooking.getGuestName(),
                firstBooking.getEmail(),
                firstBooking.getPhone(),
                bookings.size(),
                bookingSummaries
        );
    }
}