package com.paradiseresort.backend.service;

import com.paradiseresort.backend.dto.OperationsDashboardResponse;
import com.paradiseresort.backend.entity.AppUser;
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

import java.time.LocalDate;
import java.util.List;

@Service
public class OperationsDashboardService {

    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final HousekeepingTaskRepository housekeepingTaskRepository;
    private final AppUserRepository userRepository;

    public OperationsDashboardService(
            RoomRepository roomRepository,
            BookingRepository bookingRepository,
            HousekeepingTaskRepository housekeepingTaskRepository,
            AppUserRepository userRepository
    ) {
        this.roomRepository = roomRepository;
        this.bookingRepository = bookingRepository;
        this.housekeepingTaskRepository = housekeepingTaskRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public OperationsDashboardResponse getDashboard() {

        List<Room> rooms = roomRepository.findAll();

        long totalRooms = rooms.size();

        long availableRooms = countRooms(
                rooms,
                RoomStatus.AVAILABLE
        );

        long bookedRooms = countRooms(
                rooms,
                RoomStatus.BOOKED
        );

        long occupiedRooms = countRooms(
                rooms,
                RoomStatus.OCCUPIED
        );

        long cleaningRooms = countRooms(
                rooms,
                RoomStatus.CLEANING
        );

        long maintenanceRooms = countRooms(
                rooms,
                RoomStatus.MAINTENANCE
        );

        List<Booking> bookings = bookingRepository.findAll();

        long totalBookings = bookings.size();

        long pendingBookings = countBookings(
                bookings,
                BookingStatus.PENDING
        );

        long confirmedBookings = countBookings(
                bookings,
                BookingStatus.CONFIRMED
        );

        long checkedInBookings = countBookings(
                bookings,
                BookingStatus.CHECKED_IN
        );

        long checkedOutBookings = countBookings(
                bookings,
                BookingStatus.CHECKED_OUT
        );

        long cancelledBookings = countBookings(
                bookings,
                BookingStatus.CANCELLED
        );

        LocalDate today = LocalDate.now();

        long todayCheckIns = bookings.stream()
                .filter(booking ->
                        booking.getCheckIn().equals(today)
                                && booking.getStatus()
                                != BookingStatus.CANCELLED
                )
                .count();

        long todayCheckOuts = bookings.stream()
                .filter(booking ->
                        booking.getCheckOut().equals(today)
                                && booking.getStatus()
                                != BookingStatus.CANCELLED
                )
                .count();

        List<HousekeepingTask> tasks =
                housekeepingTaskRepository.findAll();

        long pendingTasks = countHousekeepingTasks(
                tasks,
                HousekeepingStatus.PENDING
        );

        long inProgressTasks = countHousekeepingTasks(
                tasks,
                HousekeepingStatus.IN_PROGRESS
        );

        long completedTasks = countHousekeepingTasks(
                tasks,
                HousekeepingStatus.COMPLETED
        );

        long cancelledTasks = countHousekeepingTasks(
                tasks,
                HousekeepingStatus.CANCELLED
        );

        List<AppUser> employees = userRepository.findAll()
                .stream()
                .filter(user ->
                        user.getRole() == Role.EMPLOYEE
                )
                .toList();

        long totalEmployees = employees.size();

        long activeEmployees = employees.stream()
                .filter(user -> user.isEnabled())
                .count();

        return new OperationsDashboardResponse(

                new OperationsDashboardResponse.RoomStats(
                        totalRooms,
                        availableRooms,
                        bookedRooms,
                        occupiedRooms,
                        cleaningRooms,
                        maintenanceRooms
                ),

                new OperationsDashboardResponse.BookingStats(
                        totalBookings,
                        pendingBookings,
                        confirmedBookings,
                        checkedInBookings,
                        checkedOutBookings,
                        cancelledBookings,
                        todayCheckIns,
                        todayCheckOuts
                ),

                new OperationsDashboardResponse.HousekeepingStats(
                        pendingTasks,
                        inProgressTasks,
                        completedTasks,
                        cancelledTasks
                ),

                new OperationsDashboardResponse.StaffStats(
                        activeEmployees,
                        totalEmployees
                )
        );
    }

    private long countRooms(
            List<Room> rooms,
            RoomStatus status
    ) {
        return rooms.stream()
                .filter(room -> room.getStatus() == status)
                .count();
    }

    private long countBookings(
            List<Booking> bookings,
            BookingStatus status
    ) {
        return bookings.stream()
                .filter(booking -> booking.getStatus() == status)
                .count();
    }

    private long countHousekeepingTasks(
            List<HousekeepingTask> tasks,
            HousekeepingStatus status
    ) {
        return tasks.stream()
                .filter(task -> task.getStatus() == status)
                .count();
    }
}