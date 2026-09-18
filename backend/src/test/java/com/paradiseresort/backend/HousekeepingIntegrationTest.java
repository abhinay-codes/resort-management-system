package com.paradiseresort.backend;

import com.paradiseresort.backend.dto.*;
import com.paradiseresort.backend.entity.*;
import com.paradiseresort.backend.repository.*;
import com.paradiseresort.backend.service.HousekeepingService;
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
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@ActiveProfiles("test-payment")
@Transactional
class HousekeepingIntegrationTest {

    @Autowired
    private HousekeepingService housekeepingService;

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
    private AppUser employee1;
    private AppUser employee2;
    private Room room1;
    private Booking booking1;

    @BeforeEach
    void setUp() {
        customer1 = new AppUser();
        customer1.setName("Alice");
        customer1.setEmail("alice.house@example.com");
        customer1.setPassword("password");
        customer1.setRole(Role.CUSTOMER);
        userRepository.save(customer1);

        employee1 = new AppUser();
        employee1.setName("Emp1");
        employee1.setEmail("emp1.house@example.com");
        employee1.setPassword("password");
        employee1.setRole(Role.EMPLOYEE);
        userRepository.save(employee1);

        employee2 = new AppUser();
        employee2.setName("Emp2");
        employee2.setEmail("emp2.house@example.com");
        employee2.setPassword("password");
        employee2.setRole(Role.EMPLOYEE);
        userRepository.save(employee2);

        room1 = new Room();
        room1.setName("House Suite");
        room1.setPrice(new BigDecimal("5000.00"));
        room1.setGuests(2);
        room1.setStatus(RoomStatus.OCCUPIED);
        roomRepository.save(room1);

        booking1 = new Booking();
        booking1.setCustomer(customer1);
        booking1.setRoom(room1);
        booking1.setGuestName("Test Guest");
        booking1.setEmail(customer1.getEmail());
        booking1.setPhone("1234567890");
        booking1.setCheckIn(LocalDate.now().minusDays(2));
        booking1.setCheckOut(LocalDate.now());
        booking1.setGuests(2);
        booking1.setTotalAmount(new BigDecimal("10000.00"));
        booking1.setStatus(BookingStatus.CHECKED_IN);
        booking1.setCreatedAt(LocalDateTime.now());
        booking1.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking1);
    }

    private void setSecurityContext(String email, String role) {
        org.springframework.security.core.userdetails.User userDetails = new org.springframework.security.core.userdetails.User(email, "password", List.of(() -> "ROLE_" + role));
        org.springframework.security.authentication.UsernamePasswordAuthenticationToken auth = new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    void testCheckoutCreatesHousekeepingTask() {
        checkOutService.checkOut(booking1.getId());
        
        List<HousekeepingTask> tasks = housekeepingTaskRepository.findAll();
        HousekeepingTask task = tasks.stream().filter(t -> t.getRoom().getId().equals(room1.getId())).findFirst().get();
        
        assertThat(task.getStatus()).isEqualTo(HousekeepingStatus.PENDING);
    }

    @Test
    void testTaskLifecycle() {
        checkOutService.checkOut(booking1.getId());
        HousekeepingTask task = housekeepingTaskRepository.findAll().stream().filter(t -> t.getRoom().getId().equals(room1.getId())).findFirst().get();
        
        // Admin or Employee assigns task? Assign is Admin/Employee (I'll use emp1 but usually assigning can be done via employee dashboard. Let's just use assignTask directly).
        housekeepingService.assignTask(task.getId(), new AssignHousekeepingTaskRequest(employee1.getId()));
        
        setSecurityContext(employee1.getEmail(), "EMPLOYEE");
        
        // PENDING -> IN_PROGRESS
        housekeepingService.updateMyTaskStatus(task.getId(), HousekeepingStatus.IN_PROGRESS);
        
        HousekeepingTask t1 = housekeepingTaskRepository.findById(task.getId()).get();
        assertThat(t1.getStatus()).isEqualTo(HousekeepingStatus.IN_PROGRESS);
        
        // IN_PROGRESS -> COMPLETED
        housekeepingService.updateMyTaskStatus(task.getId(), HousekeepingStatus.COMPLETED);
        
        HousekeepingTask t2 = housekeepingTaskRepository.findById(task.getId()).get();
        assertThat(t2.getStatus()).isEqualTo(HousekeepingStatus.COMPLETED);
        
        Room r = roomRepository.findById(room1.getId()).get();
        assertThat(r.getStatus()).isEqualTo(RoomStatus.AVAILABLE); // CLEANING -> AVAILABLE
    }

    @Test
    void testInvalidTransitionsRejected() {
        checkOutService.checkOut(booking1.getId());
        HousekeepingTask task = housekeepingTaskRepository.findAll().stream().filter(t -> t.getRoom().getId().equals(room1.getId())).findFirst().get();
        
        housekeepingService.assignTask(task.getId(), new AssignHousekeepingTaskRequest(employee1.getId()));
        
        setSecurityContext(employee1.getEmail(), "EMPLOYEE");
        // Cannot go PENDING -> COMPLETED directly without IN_PROGRESS
        assertThrows(IllegalStateException.class, () -> housekeepingService.updateMyTaskStatus(task.getId(), HousekeepingStatus.COMPLETED));
    }

    @Test
    void testEmployeeOwnershipRestrictions() {
        checkOutService.checkOut(booking1.getId());
        HousekeepingTask task = housekeepingTaskRepository.findAll().stream().filter(t -> t.getRoom().getId().equals(room1.getId())).findFirst().get();
        
        housekeepingService.assignTask(task.getId(), new AssignHousekeepingTaskRequest(employee1.getId()));
        
        // emp2 cannot update emp1's task
        setSecurityContext(employee2.getEmail(), "EMPLOYEE");
        assertThrows(IllegalArgumentException.class, () -> housekeepingService.updateMyTaskStatus(task.getId(), HousekeepingStatus.IN_PROGRESS));
    }
}
