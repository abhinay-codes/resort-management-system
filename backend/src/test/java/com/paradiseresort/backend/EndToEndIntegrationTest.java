package com.paradiseresort.backend;

import com.paradiseresort.backend.dto.*;
import com.paradiseresort.backend.entity.*;
import com.paradiseresort.backend.repository.*;
import com.paradiseresort.backend.service.*;
import com.paradiseresort.backend.security.Role;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test-payment")
@Transactional
class EndToEndIntegrationTest {

    @Autowired
    private CustomerBookingService customerBookingService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private CheckInService checkInService;

    @Autowired
    private CheckOutService checkOutService;

    @Autowired
    private HousekeepingService housekeepingService;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private AppUserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private HousekeepingTaskRepository housekeepingTaskRepository;

    private AppUser customer;
    private AppUser employee;
    private Room room;

    @BeforeEach
    void setUp() {
        customer = new AppUser();
        customer.setName("E2E Customer");
        customer.setEmail("e2e.customer@example.com");
        customer.setPassword("password");
        customer.setRole(Role.CUSTOMER);
        userRepository.save(customer);

        employee = new AppUser();
        employee.setName("E2E Employee");
        employee.setEmail("e2e.employee@example.com");
        employee.setPassword("password");
        employee.setRole(Role.EMPLOYEE);
        userRepository.save(employee);

        room = new Room();
        room.setName("E2E Suite");
        room.setPrice(new BigDecimal("5000.00"));
        room.setGuests(2);
        room.setStatus(RoomStatus.AVAILABLE);
        roomRepository.save(room);
    }

    private void setSecurityContext(String email, String role) {
        org.springframework.security.core.userdetails.User userDetails = new org.springframework.security.core.userdetails.User(email, "password", List.of(() -> "ROLE_" + role));
        org.springframework.security.authentication.UsernamePasswordAuthenticationToken auth = new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    void testCompleteBusinessLifecycle() {
        // 1. Customer creates booking
        BookingRequest req = new BookingRequest(customer.getName(), customer.getEmail(), "123", "None", LocalDate.now(), LocalDate.now().plusDays(2), 2, room.getId());
        CustomerBookingResponse bookingRes = customerBookingService.createBooking(req, customer.getEmail());
        
        Booking b = bookingRepository.findById(bookingRes.id()).get();
        assertThat(b.getStatus()).isEqualTo(BookingStatus.PENDING);
        assertThat(roomRepository.findById(room.getId()).get().getStatus()).isEqualTo(RoomStatus.AVAILABLE);
        
        // 2. Payment
        PaymentResponse payRes = paymentService.createCustomerPayment(b.getId(), customer.getEmail());
        String sig = "TEST-SIGNATURE-" + payRes.gatewayOrderId() + "-PAY-E2E";
        paymentService.processWebhook(payRes.gatewayOrderId(), "PAY-E2E", sig, true);
        
        b = bookingRepository.findById(bookingRes.id()).get();
        assertThat(b.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
        
        // 3. Check-In
        checkInService.checkIn(b.getId());
        
        b = bookingRepository.findById(bookingRes.id()).get();
        assertThat(b.getStatus()).isEqualTo(BookingStatus.CHECKED_IN);
        assertThat(roomRepository.findById(room.getId()).get().getStatus()).isEqualTo(RoomStatus.OCCUPIED);
        
        // 4. Check-Out
        checkOutService.checkOut(b.getId());
        
        b = bookingRepository.findById(bookingRes.id()).get();
        assertThat(b.getStatus()).isEqualTo(BookingStatus.CHECKED_OUT);
        assertThat(roomRepository.findById(room.getId()).get().getStatus()).isEqualTo(RoomStatus.CLEANING);
        
        // 5. Housekeeping
        List<HousekeepingTask> tasks = housekeepingTaskRepository.findAll();
        HousekeepingTask task = tasks.stream().filter(t -> t.getRoom().getId().equals(room.getId()) && t.getStatus() == HousekeepingStatus.PENDING).findFirst().get();
        
        housekeepingService.assignTask(task.getId(), new AssignHousekeepingTaskRequest(employee.getId()));
        
        setSecurityContext(employee.getEmail(), "EMPLOYEE");
        housekeepingService.updateMyTaskStatus(task.getId(), HousekeepingStatus.IN_PROGRESS);
        housekeepingService.updateMyTaskStatus(task.getId(), HousekeepingStatus.COMPLETED);
        
        // 6. Room is AVAILABLE
        assertThat(roomRepository.findById(room.getId()).get().getStatus()).isEqualTo(RoomStatus.AVAILABLE);
    }
}
