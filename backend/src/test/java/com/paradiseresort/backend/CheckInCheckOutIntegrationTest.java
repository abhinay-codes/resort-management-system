package com.paradiseresort.backend;

import com.paradiseresort.backend.dto.*;
import com.paradiseresort.backend.entity.*;
import com.paradiseresort.backend.repository.*;
import com.paradiseresort.backend.service.CheckInService;
import com.paradiseresort.backend.service.CheckOutService;
import com.paradiseresort.backend.security.Role;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@ActiveProfiles("test-payment")
@Transactional
class CheckInCheckOutIntegrationTest {

    @Autowired
    private CheckInService checkInService;

    @Autowired
    private CheckOutService checkOutService;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private AppUserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private HousekeepingTaskRepository housekeepingTaskRepository;

    private AppUser customer1;
    private Room room1;
    private Booking booking1;

    @BeforeEach
    void setUp() {
        customer1 = new AppUser();
        customer1.setName("Alice");
        customer1.setEmail("alice.check@example.com");
        customer1.setPassword("password");
        customer1.setRole(Role.CUSTOMER);
        userRepository.save(customer1);

        room1 = new Room();
        room1.setName("CheckIn Suite");
        room1.setPrice(new BigDecimal("5000.00"));
        room1.setGuests(2);
        room1.setStatus(RoomStatus.AVAILABLE);
        roomRepository.save(room1);

        AppUser employee = new AppUser();
        employee.setName("Emp");
        employee.setEmail("emp@example.com");
        employee.setPassword("pass");
        employee.setRole(Role.EMPLOYEE);
        employee.setEnabled(true);
        userRepository.save(employee);

        booking1 = new Booking();
        booking1.setCustomer(customer1);
        booking1.setRoom(room1);
        booking1.setGuestName("Test Guest");
        booking1.setEmail(customer1.getEmail());
        booking1.setPhone("1234567890");
        booking1.setCheckIn(LocalDate.now()); // checkin today
        booking1.setCheckOut(LocalDate.now().plusDays(2));
        booking1.setGuests(2);
        booking1.setTotalAmount(new BigDecimal("10000.00"));
        booking1.setStatus(BookingStatus.CONFIRMED);
        booking1.setCreatedAt(LocalDateTime.now());
        booking1.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking1);
    }

    @Test
    void testValidCheckInSucceeds() {
        checkInService.checkIn(booking1.getId());
        
        Booking b = bookingRepository.findById(booking1.getId()).get();
        assertThat(b.getStatus()).isEqualTo(BookingStatus.CHECKED_IN);
        
        Room r = roomRepository.findById(room1.getId()).get();
        assertThat(r.getStatus()).isEqualTo(RoomStatus.OCCUPIED);
    }

    @Test
    void testCheckInBeforeAllowedDateRejected() {
        booking1.setCheckIn(LocalDate.now().plusDays(1)); // future date
        bookingRepository.save(booking1);
        
        assertThrows(IllegalStateException.class, () -> checkInService.checkIn(booking1.getId()));
    }

    @Test
    void testCheckInNonConfirmedRejected() {
        booking1.setStatus(BookingStatus.PENDING);
        bookingRepository.save(booking1);
        
        assertThrows(IllegalStateException.class, () -> checkInService.checkIn(booking1.getId()));
    }

    @Test
    void testCheckInRoomNotAvailableRejected() {
        room1.setStatus(RoomStatus.CLEANING);
        roomRepository.save(room1);
        
        assertThrows(IllegalStateException.class, () -> checkInService.checkIn(booking1.getId()));
    }

    @Test
    void testValidCheckOutSucceeds() {
        booking1.setStatus(BookingStatus.CHECKED_IN);
        bookingRepository.save(booking1);
        room1.setStatus(RoomStatus.OCCUPIED);
        roomRepository.save(room1);
        
        checkOutService.checkOut(booking1.getId());
        
        Booking b = bookingRepository.findById(booking1.getId()).get();
        assertThat(b.getStatus()).isEqualTo(BookingStatus.CHECKED_OUT);
        
        Room r = roomRepository.findById(room1.getId()).get();
        assertThat(r.getStatus()).isEqualTo(RoomStatus.CLEANING);
        
        // housekeeping task created
        long tasks = housekeepingTaskRepository.count();
        assertThat(tasks).isGreaterThan(0);
    }

    @Test
    void testCheckOutNonCheckedInRejected() {
        assertThrows(IllegalStateException.class, () -> checkOutService.checkOut(booking1.getId()));
    }
}
