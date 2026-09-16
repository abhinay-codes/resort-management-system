package com.paradiseresort.backend.dto;

public record OperationsDashboardResponse(

        RoomStats rooms,

        BookingStats bookings,

        HousekeepingStats housekeeping,

        StaffStats staff

) {

    public record RoomStats(
            long total,
            long available,
            long booked,
            long occupied,
            long cleaning,
            long maintenance
    ) {
    }

    public record BookingStats(
            long total,
            long pending,
            long confirmed,
            long checkedIn,
            long checkedOut,
            long cancelled,
            long todayCheckIns,
            long todayCheckOuts
    ) {
    }

    public record HousekeepingStats(
            long pending,
            long inProgress,
            long completed,
            long cancelled
    ) {
    }

    public record StaffStats(
            long activeEmployees,
            long totalEmployees
    ) {
    }
}