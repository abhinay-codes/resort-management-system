package com.paradiseresort.backend.service;

import com.paradiseresort.backend.dto.BookingResponse;
import com.paradiseresort.backend.entity.Booking;
import com.paradiseresort.backend.entity.BookingStatus;
import com.paradiseresort.backend.entity.HousekeepingStatus;
import com.paradiseresort.backend.entity.HousekeepingTask;
import com.paradiseresort.backend.entity.Room;
import com.paradiseresort.backend.entity.RoomStatus;
import com.paradiseresort.backend.repository.AppUserRepository;
import com.paradiseresort.backend.repository.BookingRepository;
import com.paradiseresort.backend.repository.HousekeepingTaskRepository;
import com.paradiseresort.backend.repository.RoomRepository;
import com.paradiseresort.backend.security.Role;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CheckOutService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final HousekeepingTaskRepository housekeepingRepository;
    private final AppUserRepository userRepository;
    private final RoomStateService roomStateService;

    public CheckOutService(
            BookingRepository bookingRepository,
            RoomRepository roomRepository,
            HousekeepingTaskRepository housekeepingRepository,
            AppUserRepository userRepository,
            RoomStateService roomStateService
    ) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.housekeepingRepository = housekeepingRepository;
        this.userRepository = userRepository;
        this.roomStateService = roomStateService;
    }

    @Transactional
    public BookingResponse checkOut(Long bookingId) {

        if (bookingId == null || bookingId <= 0) {
            throw new IllegalArgumentException(
                    "Booking ID must be positive."
            );
        }

        Booking booking =
                bookingRepository.findByIdForUpdate(bookingId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Booking not found."
                                )
                        );

        if (booking.getStatus()
                != BookingStatus.CHECKED_IN) {

            throw new IllegalStateException(
                    "Only checked-in bookings can be checked out."
            );
        }

        Long roomId =
                booking.getRoom().getId();

        Room room =
                roomRepository.findById(roomId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Room not found."
                                )
                        );

        /*
         * Centralized transition:
         *
         * OCCUPIED → CLEANING
         */
        roomStateService.transition(
                roomId,
                RoomStatus.CLEANING
        );

        booking.setStatus(
                BookingStatus.CHECKED_OUT
        );

        bookingRepository.save(booking);

        /*
         * Automatically create housekeeping work.
         */
        boolean alreadyExists =
                housekeepingRepository
                        .existsByRoom_IdAndStatusIn(
                                roomId,
                                List.of(
                                        HousekeepingStatus.PENDING,
                                        HousekeepingStatus.IN_PROGRESS
                                )
                        );

        if (!alreadyExists) {

            var employee =
                    userRepository.findAll()
                            .stream()
                            .filter(user ->
                                    user.getRole()
                                            == Role.EMPLOYEE
                                            && user.isEnabled()
                            )
                            .findFirst()
                            .orElseThrow(() ->
                                    new IllegalStateException(
                                            "No enabled employee is available."
                                    )
                            );

            HousekeepingTask task =
                    new HousekeepingTask();

            task.setRoom(room);
            task.setAssignedEmployee(employee);
            task.setStatus(
                    HousekeepingStatus.PENDING
            );
            task.setNotes(
                    "Automatic housekeeping after checkout."
            );

            housekeepingRepository.save(task);
        }

        return BookingResponse.fromEntity(booking);
    }
}