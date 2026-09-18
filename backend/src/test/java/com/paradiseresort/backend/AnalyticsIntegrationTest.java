package com.paradiseresort.backend;

import com.paradiseresort.backend.dto.*;
import com.paradiseresort.backend.entity.*;
import com.paradiseresort.backend.repository.*;
import com.paradiseresort.backend.service.AnalyticsService;
import com.paradiseresort.backend.security.Role;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import com.paradiseresort.backend.controller.AdminAnalyticsController;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.access.AccessDeniedException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@ActiveProfiles("test-payment")
class AnalyticsIntegrationTest {

    @Autowired
    private AdminAnalyticsController adminAnalyticsController;

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private HousekeepingTaskRepository housekeepingTaskRepository;
    
    @Autowired
    private MaintenanceTaskRepository maintenanceTaskRepository;

    private AppUser admin;
    private AppUser customer;
    private AppUser employee;
    private Room room1;
    private Room room2;

    @BeforeEach
    void setUp() {
        cleanDb();

        admin = new AppUser();
        admin.setName("Admin");
        admin.setEmail("admin.analytics@example.com");
        admin.setPassword("password");
        admin.setRole(Role.ADMIN);
        admin.setEnabled(true);
        appUserRepository.save(admin);

        customer = new AppUser();
        customer.setName("Customer");
        customer.setEmail("customer.analytics@example.com");
        customer.setPassword("password");
        customer.setRole(Role.CUSTOMER);
        customer.setEnabled(true);
        appUserRepository.save(customer);

        employee = new AppUser();
        employee.setName("Employee");
        employee.setEmail("employee.analytics@example.com");
        employee.setPassword("password");
        employee.setRole(Role.EMPLOYEE);
        employee.setEnabled(true);
        appUserRepository.save(employee);

        room1 = new Room();
        room1.setName("Suite A");
        room1.setDescription("Nice room");
        room1.setPrice(new BigDecimal("5000.00"));
        room1.setGuests(2);
        room1.setStatus(RoomStatus.AVAILABLE);
        roomRepository.save(room1);

        room2 = new Room();
        room2.setName("Suite B");
        room2.setDescription("Another room");
        room2.setPrice(new BigDecimal("3000.00"));
        room2.setGuests(2);
        room2.setStatus(RoomStatus.AVAILABLE);
        roomRepository.save(room2);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
        cleanDb();
    }

    private void cleanDb() {
        notificationRepository.deleteAll();
        paymentRepository.deleteAll();
        bookingRepository.deleteAll();
        housekeepingTaskRepository.deleteAll();
        maintenanceTaskRepository.deleteAll();
        roomRepository.deleteAll();
        appUserRepository.deleteAll();
    }

    private Booking createBooking(Room room, AppUser user, BookingStatus status, LocalDate checkIn, LocalDate checkOut, LocalDateTime createdAt) {
        Booking b = new Booking();
        b.setRoom(room);
        b.setCustomer(user);
        b.setGuestName(user.getName());
        b.setEmail(user.getEmail());
        b.setPhone("12345");
        b.setCheckIn(checkIn);
        b.setCheckOut(checkOut);
        b.setGuests(2);
        b.setStatus(status);
        b.setTotalAmount(room.getPrice().multiply(new BigDecimal(checkIn.until(checkOut).getDays())));
        b.setCreatedAt(createdAt);
        b.setUpdatedAt(createdAt);
        return bookingRepository.save(b);
    }

    private Payment createPayment(Booking b, PaymentStatus status, BigDecimal amount) {
        Payment p = new Payment();
        p.setBooking(b);
        p.setStatus(status);
        p.setAmount(amount);
        p.setCreatedAt(LocalDateTime.now());
        p.setUpdatedAt(LocalDateTime.now());
        return paymentRepository.save(p);
    }
    
    private void setSecurityContext(String email, String role) {
        User userDetails = new User(email, "password", List.of(() -> "ROLE_" + role));
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    void testSecurityAccess() {
        // ADMIN can access
        setSecurityContext("admin.analytics@example.com", "ADMIN");
        ResponseEntity<AnalyticsSummaryResponse> res = adminAnalyticsController.getSummary(null, null);
        assertThat(res.getStatusCode().is2xxSuccessful()).isTrue();

        // CUSTOMER cannot access
        setSecurityContext("customer.analytics@example.com", "CUSTOMER");
        assertThrows(AccessDeniedException.class, () -> adminAnalyticsController.getSummary(null, null));

        // EMPLOYEE cannot access
        setSecurityContext("employee.analytics@example.com", "EMPLOYEE");
        assertThrows(AccessDeniedException.class, () -> adminAnalyticsController.getSummary(null, null));

        // Unauthenticated cannot access
        SecurityContextHolder.clearContext();
        assertThrows(org.springframework.security.authentication.AuthenticationCredentialsNotFoundException.class, 
                () -> adminAnalyticsController.getSummary(null, null));
    }

    @Test
    void testRevenueCalculation() {
        // Create booking with SUCCESS payment
        Booking b1 = createBooking(room1, customer, BookingStatus.CONFIRMED, LocalDate.now(), LocalDate.now().plusDays(2), LocalDateTime.now());
        createPayment(b1, PaymentStatus.SUCCESS, new BigDecimal("10000.00"));

        // Create booking with PENDING payment
        Booking b2 = createBooking(room1, customer, BookingStatus.PENDING, LocalDate.now(), LocalDate.now().plusDays(2), LocalDateTime.now());
        createPayment(b2, PaymentStatus.PENDING, new BigDecimal("10000.00"));

        // Create booking with REFUNDED payment
        Booking b3 = createBooking(room1, customer, BookingStatus.CANCELLED, LocalDate.now(), LocalDate.now().plusDays(2), LocalDateTime.now());
        createPayment(b3, PaymentStatus.REFUNDED, new BigDecimal("10000.00"));

        AnalyticsSummaryResponse summary = analyticsService.getSummary(null, null);
        assertThat(summary.totalRevenue()).isEqualByComparingTo(new BigDecimal("10000.00")); // Only b1 counts
    }

    @Test
    void testOccupancyCalculation() {
        // b1: CHECKED_IN (Occupies room1 for 3 nights from today)
        createBooking(room1, customer, BookingStatus.CHECKED_IN, LocalDate.now(), LocalDate.now().plusDays(3), LocalDateTime.now());
        
        // b2: CONFIRMED (Should NOT count as occupancy)
        createBooking(room2, customer, BookingStatus.CONFIRMED, LocalDate.now(), LocalDate.now().plusDays(3), LocalDateTime.now());

        OccupancyAnalyticsResponse occ = analyticsService.getOccupancy(LocalDate.now(), LocalDate.now().plusDays(2)); 
        // 3 days range. Total available = 2 rooms * 3 days = 6 nights
        // Occupied = room1 for 3 nights.
        
        assertThat(occ.totalAvailableRoomNights()).isEqualTo(6);
        assertThat(occ.occupiedRoomNights()).isEqualTo(3);
        assertThat(occ.occupancyPercentage()).isEqualTo(50.0);
    }
    
    @Test
    void testRoomPerformance() {
        Booking b1 = createBooking(room1, customer, BookingStatus.CHECKED_OUT, LocalDate.now(), LocalDate.now().plusDays(2), LocalDateTime.now());
        createPayment(b1, PaymentStatus.SUCCESS, new BigDecimal("10000.00"));

        Booking b2 = createBooking(room1, customer, BookingStatus.CANCELLED, LocalDate.now(), LocalDate.now().plusDays(2), LocalDateTime.now());
        
        List<RoomPerformanceResponse> rooms = analyticsService.getRoomPerformance(null, null);
        
        RoomPerformanceResponse r1 = rooms.stream().filter(r -> r.roomId().equals(room1.getId())).findFirst().get();
        assertThat(r1.bookingCount()).isEqualTo(2);
        assertThat(r1.cancellationCount()).isEqualTo(1);
        assertThat(r1.retainedRevenue()).isEqualByComparingTo(new BigDecimal("10000.00"));
        
        RoomPerformanceResponse r2 = rooms.stream().filter(r -> r.roomId().equals(room2.getId())).findFirst().get();
        assertThat(r2.bookingCount()).isEqualTo(0);
    }
    
    @Test
    void testDateRangeFilteringAndValidation() {
        Booking b1 = createBooking(room1, customer, BookingStatus.CHECKED_OUT, LocalDate.now(), LocalDate.now().plusDays(2), LocalDateTime.now().minusDays(10));
        Booking b2 = createBooking(room1, customer, BookingStatus.CHECKED_OUT, LocalDate.now(), LocalDate.now().plusDays(2), LocalDateTime.now());
        
        AnalyticsSummaryResponse summaryAll = analyticsService.getSummary(null, null);
        assertThat(summaryAll.totalBookings()).isEqualTo(2);
        
        AnalyticsSummaryResponse summaryRecent = analyticsService.getSummary(LocalDate.now().minusDays(2), LocalDate.now().plusDays(2));
        assertThat(summaryRecent.totalBookings()).isEqualTo(1); // Only b2
        
        // Test Controller Validation
        setSecurityContext("admin.analytics@example.com", "ADMIN");
        assertThrows(IllegalArgumentException.class, () -> 
                adminAnalyticsController.getSummary(LocalDate.of(2024, 1, 10), LocalDate.of(2024, 1, 5)));
    }
    
    @Test
    void testCustomerAnalytics() {
        // Employee/Admin shouldn't count
        // Customer 1 is created. Let's create customer 2.
        AppUser c2 = new AppUser();
        c2.setName("C2");
        c2.setEmail("c2@example.com");
        c2.setPassword("pass");
        c2.setRole(Role.CUSTOMER);
        appUserRepository.save(c2);
        
        createBooking(room1, customer, BookingStatus.CHECKED_OUT, LocalDate.now(), LocalDate.now().plusDays(2), LocalDateTime.now());
        
        CustomerAnalyticsResponse stats = analyticsService.getCustomerAnalytics(null, null);
        assertThat(stats.totalRegisteredCustomers()).isEqualTo(2);
        assertThat(stats.customersWithBookingsInRange()).isEqualTo(1); // Only `customer`
    }
    
    @Test
    void testMonthlyAnalytics() {
        LocalDateTime janDate = LocalDateTime.of(LocalDate.now().getYear(), 1, 15, 12, 0);
        Booking b1 = createBooking(room1, customer, BookingStatus.CHECKED_OUT, janDate.toLocalDate(), janDate.toLocalDate().plusDays(2), janDate);
        createPayment(b1, PaymentStatus.SUCCESS, new BigDecimal("5000.00"));
        
        List<MonthlyAnalyticsResponse> monthly = analyticsService.getMonthlyAnalytics(LocalDate.now().getYear());
        assertThat(monthly).hasSize(12);
        
        MonthlyAnalyticsResponse jan = monthly.get(0);
        assertThat(jan.month()).endsWith("-01");
        assertThat(jan.bookings()).isEqualTo(1);
        assertThat(jan.revenue()).isEqualByComparingTo(new BigDecimal("5000.00"));
        assertThat(jan.occupancyPercentage()).isGreaterThan(0.0);
    }
}
