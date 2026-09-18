package com.paradiseresort.backend.service;

import com.paradiseresort.backend.dto.*;
import com.paradiseresort.backend.entity.*;
import com.paradiseresort.backend.repository.AppUserRepository;
import com.paradiseresort.backend.repository.BookingRepository;
import com.paradiseresort.backend.repository.PaymentRepository;
import com.paradiseresort.backend.repository.RoomRepository;
import com.paradiseresort.backend.security.Role;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AnalyticsService {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final RoomRepository roomRepository;
    private final AppUserRepository appUserRepository;

    public AnalyticsService(
            BookingRepository bookingRepository,
            PaymentRepository paymentRepository,
            RoomRepository roomRepository,
            AppUserRepository appUserRepository) {
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.roomRepository = roomRepository;
        this.appUserRepository = appUserRepository;
    }

    private boolean isWithinRange(LocalDateTime dateTime, LocalDate from, LocalDate to) {
        if (dateTime == null) return false;
        LocalDate date = dateTime.toLocalDate();
        if (from != null && date.isBefore(from)) return false;
        if (to != null && date.isAfter(to)) return false;
        return true;
    }

    private boolean isOverlapping(LocalDate checkIn, LocalDate checkOut, LocalDate from, LocalDate to) {
        if (checkIn == null || checkOut == null) return false;
        if (from != null && checkOut.isBefore(from) || (from != null && checkOut.isEqual(from))) return false;
        if (to != null && checkIn.isAfter(to)) return false;
        return true;
    }

    private long calculateOverlappingDays(LocalDate checkIn, LocalDate checkOut, LocalDate from, LocalDate to) {
        LocalDate start = checkIn;
        if (from != null && from.isAfter(start)) {
            start = from;
        }
        LocalDate end = checkOut;
        if (to != null && to.isBefore(end)) {
            end = to.plusDays(1); // checkout day itself is not counted, but 'to' is inclusive date boundary
        }
        if (start.isBefore(end)) {
            return ChronoUnit.DAYS.between(start, end);
        }
        return 0;
    }

    /*
     * 1. SUMMARY
     * 
     * Revenue = sum of successful retained payments.
     * Exclude: PENDING, FAILED, REFUNDED.
     */
    public AnalyticsSummaryResponse getSummary(LocalDate from, LocalDate to) {
        List<Booking> allBookings = bookingRepository.findAll();
        List<Booking> rangeBookings = allBookings.stream()
                .filter(b -> isWithinRange(b.getCreatedAt(), from, to))
                .toList();

        long totalBookings = rangeBookings.size();
        long cancelledBookings = rangeBookings.stream().filter(b -> b.getStatus() == BookingStatus.CANCELLED).count();
        double cancellationRate = totalBookings > 0 ? ((double) cancelledBookings / totalBookings) * 100.0 : 0.0;

        Map<String, Long> byStatus = new HashMap<>();
        for (BookingStatus status : BookingStatus.values()) {
            byStatus.put(status.name(), rangeBookings.stream().filter(b -> b.getStatus() == status).count());
        }

        BigDecimal totalRevenue = BigDecimal.ZERO;
        List<Payment> allPayments = paymentRepository.findAll();
        
        for (Booking booking : rangeBookings) {
            // Find successful payments for this booking
            BigDecimal bookingRevenue = allPayments.stream()
                    .filter(p -> p.getBooking() != null && p.getBooking().getId().equals(booking.getId()))
                    .filter(p -> p.getStatus() == PaymentStatus.SUCCESS)
                    .map(Payment::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            totalRevenue = totalRevenue.add(bookingRevenue);
        }

        return new AnalyticsSummaryResponse(totalRevenue, totalBookings, cancelledBookings, cancellationRate, byStatus);
    }

    /*
     * 2. OCCUPANCY
     * 
     * Calculate actual occupied room-nights from the booking stay interval (checkIn -> checkOut).
     * Use actual stay statuses: CHECKED_IN, CHECKED_OUT.
     */
    public OccupancyAnalyticsResponse getOccupancy(LocalDate from, LocalDate to) {
        LocalDate actualFrom = from != null ? from : LocalDate.now().minusMonths(1);
        LocalDate actualTo = to != null ? to : LocalDate.now();

        long daysInRange = ChronoUnit.DAYS.between(actualFrom, actualTo.plusDays(1));
        long totalRooms = roomRepository.count();
        long totalAvailableRoomNights = totalRooms * daysInRange;

        List<Booking> allBookings = bookingRepository.findAll();
        long occupiedRoomNights = 0;

        for (Booking b : allBookings) {
            if (b.getStatus() == BookingStatus.CHECKED_IN || b.getStatus() == BookingStatus.CHECKED_OUT) {
                if (isOverlapping(b.getCheckIn(), b.getCheckOut(), actualFrom, actualTo)) {
                    occupiedRoomNights += calculateOverlappingDays(b.getCheckIn(), b.getCheckOut(), actualFrom, actualTo);
                }
            }
        }

        double percentage = totalAvailableRoomNights > 0 
                ? ((double) occupiedRoomNights / totalAvailableRoomNights) * 100.0 
                : 0.0;

        return new OccupancyAnalyticsResponse(totalAvailableRoomNights, occupiedRoomNights, percentage);
    }

    /*
     * 3. ROOM PERFORMANCE
     */
    public List<RoomPerformanceResponse> getRoomPerformance(LocalDate from, LocalDate to) {
        List<Room> rooms = roomRepository.findAll();
        List<Booking> rangeBookings = bookingRepository.findAll().stream()
                .filter(b -> isWithinRange(b.getCreatedAt(), from, to))
                .toList();
        List<Payment> allPayments = paymentRepository.findAll();

        List<RoomPerformanceResponse> response = new ArrayList<>();
        for (Room room : rooms) {
            List<Booking> roomBookings = rangeBookings.stream()
                    .filter(b -> b.getRoom().getId().equals(room.getId()))
                    .toList();
            
            long bookingCount = roomBookings.size();
            long cancellationCount = roomBookings.stream().filter(b -> b.getStatus() == BookingStatus.CANCELLED).count();
            
            BigDecimal revenue = BigDecimal.ZERO;
            for (Booking b : roomBookings) {
                BigDecimal bRev = allPayments.stream()
                    .filter(p -> p.getBooking() != null && p.getBooking().getId().equals(b.getId()))
                    .filter(p -> p.getStatus() == PaymentStatus.SUCCESS)
                    .map(Payment::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                revenue = revenue.add(bRev);
            }
            
            response.add(new RoomPerformanceResponse(room.getId(), room.getName(), bookingCount, revenue, cancellationCount));
        }
        return response;
    }

    /*
     * 4. CUSTOMER STATISTICS
     */
    public CustomerAnalyticsResponse getCustomerAnalytics(LocalDate from, LocalDate to) {
        List<AppUser> customers = appUserRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.CUSTOMER)
                .toList();
                
        List<Booking> rangeBookings = bookingRepository.findAll().stream()
                .filter(b -> isWithinRange(b.getCreatedAt(), from, to))
                .toList();

        long customersWithBookings = rangeBookings.stream()
                .map(b -> b.getCustomer() != null ? b.getCustomer().getId() : null)
                .filter(Objects::nonNull)
                .distinct()
                .count();

        // New customers: approximate by finding customers whose earliest booking is in range
        List<Booking> allBookings = bookingRepository.findAll();
        Map<Long, LocalDateTime> firstBookingDateByCustomer = new HashMap<>();
        for (Booking b : allBookings) {
            if (b.getCustomer() != null) {
                Long cid = b.getCustomer().getId();
                if (!firstBookingDateByCustomer.containsKey(cid) || b.getCreatedAt().isBefore(firstBookingDateByCustomer.get(cid))) {
                    firstBookingDateByCustomer.put(cid, b.getCreatedAt());
                }
            }
        }
        
        long newCustomers = firstBookingDateByCustomer.values().stream()
                .filter(date -> isWithinRange(date, from, to))
                .count();

        return new CustomerAnalyticsResponse(customers.size(), newCustomers, customersWithBookings);
    }

    /*
     * 5. MONTHLY ANALYTICS
     */
    public List<MonthlyAnalyticsResponse> getMonthlyAnalytics(int year) {
        List<Booking> yearBookings = bookingRepository.findAll().stream()
                .filter(b -> b.getCreatedAt() != null && b.getCreatedAt().getYear() == year)
                .toList();
        List<Payment> allPayments = paymentRepository.findAll();

        // Group bookings by month
        Map<Integer, List<Booking>> bookingsByMonth = yearBookings.stream()
                .collect(Collectors.groupingBy(b -> b.getCreatedAt().getMonthValue()));

        List<MonthlyAnalyticsResponse> response = new ArrayList<>();
        long totalRooms = roomRepository.count();

        for (int m = 1; m <= 12; m++) {
            YearMonth ym = YearMonth.of(year, m);
            String monthStr = ym.toString();
            List<Booking> mBookings = bookingsByMonth.getOrDefault(m, new ArrayList<>());
            
            long bookings = mBookings.size();
            long cancellations = mBookings.stream().filter(b -> b.getStatus() == BookingStatus.CANCELLED).count();
            
            BigDecimal revenue = BigDecimal.ZERO;
            for (Booking b : mBookings) {
                BigDecimal bRev = allPayments.stream()
                    .filter(p -> p.getBooking() != null && p.getBooking().getId().equals(b.getId()))
                    .filter(p -> p.getStatus() == PaymentStatus.SUCCESS)
                    .map(Payment::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                revenue = revenue.add(bRev);
            }

            // Occupancy for the month
            LocalDate monthStart = ym.atDay(1);
            LocalDate monthEnd = ym.atEndOfMonth();
            long daysInMonth = ym.lengthOfMonth();
            long availableNights = totalRooms * daysInMonth;
            long occupiedNights = 0;
            
            // Note: Occupancy uses ALL bookings, not just those created in this month!
            List<Booking> allSystemBookings = bookingRepository.findAll();
            for (Booking b : allSystemBookings) {
                if (b.getStatus() == BookingStatus.CHECKED_IN || b.getStatus() == BookingStatus.CHECKED_OUT) {
                    if (isOverlapping(b.getCheckIn(), b.getCheckOut(), monthStart, monthEnd)) {
                        occupiedNights += calculateOverlappingDays(b.getCheckIn(), b.getCheckOut(), monthStart, monthEnd);
                    }
                }
            }
            
            double occupancy = availableNights > 0 ? ((double) occupiedNights / availableNights) * 100.0 : 0.0;
            
            response.add(new MonthlyAnalyticsResponse(monthStr, revenue, bookings, cancellations, occupancy));
        }

        return response;
    }
}

