package com.paradiseresort.backend;

import com.paradiseresort.backend.dto.AssignMaintenanceTaskRequest;
import com.paradiseresort.backend.dto.CreateMaintenanceTaskRequest;
import com.paradiseresort.backend.dto.MaintenanceTaskResponse;
import com.paradiseresort.backend.dto.UpdateMaintenanceTaskStatusRequest;
import com.paradiseresort.backend.entity.*;
import com.paradiseresort.backend.repository.*;
import com.paradiseresort.backend.security.Role;
import com.paradiseresort.backend.service.MaintenanceService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@ActiveProfiles("test-payment")
@Transactional
class MaintenanceIntegrationTest {

    @Autowired
    private MaintenanceService maintenanceService;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private AppUserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private MaintenanceTaskRepository maintenanceTaskRepository;

    @Autowired
    private HousekeepingTaskRepository housekeepingTaskRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    private Room room1;
    private AppUser adminUser;
    private AppUser employeeUser;

    @BeforeEach
    void setUp() {
        maintenanceTaskRepository.deleteAll();
        housekeepingTaskRepository.deleteAll();
        paymentRepository.deleteAll();
        bookingRepository.deleteAll();
        roomRepository.deleteAll();
        userRepository.deleteAll();

        String uniqueSuffix = java.util.UUID.randomUUID().toString();

        adminUser = new AppUser();
        adminUser.setEmail("admin_" + uniqueSuffix + "@test.com");
        adminUser.setName("Admin");
        adminUser.setPassword("password");
        adminUser.setRole(Role.ADMIN);
        adminUser.setEnabled(true);
        userRepository.save(adminUser);

        employeeUser = new AppUser();
        employeeUser.setEmail("employee_" + uniqueSuffix + "@test.com");
        employeeUser.setName("Employee");
        employeeUser.setPassword("password");
        employeeUser.setRole(Role.EMPLOYEE);
        employeeUser.setEnabled(true);
        userRepository.save(employeeUser);

        room1 = new Room("Room 101", "Test room", BigDecimal.valueOf(100), 2, "image.jpg");
        room1.setStatus(RoomStatus.AVAILABLE);
        roomRepository.save(room1);
    }

    private void authenticateAs(AppUser appUser) {
        User springUser = new User(appUser.getEmail(), appUser.getPassword(), List.of());
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(springUser, null, springUser.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    void adminCanCreateAndAssignTask() {
        authenticateAs(adminUser);

        CreateMaintenanceTaskRequest createReq = new CreateMaintenanceTaskRequest(room1.getId(), "Leaky faucet");
        MaintenanceTaskResponse response = maintenanceService.createTask(createReq, false);

        assertThat(response.issueNote()).isEqualTo("Leaky faucet");
        assertThat(response.status()).isEqualTo(MaintenanceStatus.OPEN);

        Room updatedRoom = roomRepository.findById(room1.getId()).orElseThrow();
        assertThat(updatedRoom.getStatus()).isEqualTo(RoomStatus.MAINTENANCE);

        AssignMaintenanceTaskRequest assignReq = new AssignMaintenanceTaskRequest(employeeUser.getId());
        MaintenanceTaskResponse assignedResponse = maintenanceService.assignTask(response.id(), assignReq);

        assertThat(assignedResponse.assignedEmployeeId()).isEqualTo(employeeUser.getId());
    }

    @Test
    void employeeCanReportAndResolveTask() {
        authenticateAs(employeeUser);

        CreateMaintenanceTaskRequest createReq = new CreateMaintenanceTaskRequest(room1.getId(), "Broken window");
        MaintenanceTaskResponse response = maintenanceService.createTask(createReq, true);

        assertThat(response.assignedEmployeeId()).isEqualTo(employeeUser.getId());

        // Start task
        UpdateMaintenanceTaskStatusRequest startReq = new UpdateMaintenanceTaskStatusRequest(MaintenanceStatus.IN_PROGRESS, null);
        maintenanceService.updateTaskStatus(response.id(), startReq, true);

        // Resolve task
        UpdateMaintenanceTaskStatusRequest resolveReq = new UpdateMaintenanceTaskStatusRequest(MaintenanceStatus.RESOLVED, "Fixed it");
        maintenanceService.updateTaskStatus(response.id(), resolveReq, true);

        Room updatedRoom = roomRepository.findById(room1.getId()).orElseThrow();
        assertThat(updatedRoom.getStatus()).isEqualTo(RoomStatus.AVAILABLE);
    }

    @Test
    void cannotCreateTaskWithFutureBookingConflict() {
        authenticateAs(adminUser);

        Booking booking = new Booking();
        booking.setRoom(room1);
        booking.setCustomer(adminUser);
        booking.setGuestName("Test Guest");
        booking.setEmail("guest@test.com");
        booking.setPhone("1234567890");
        booking.setCheckIn(LocalDate.now().minusDays(1));
        booking.setCheckOut(LocalDate.now().plusDays(2)); // Checkout after today
        booking.setGuests(1);
        booking.setTotalAmount(BigDecimal.valueOf(100));
        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        CreateMaintenanceTaskRequest createReq = new CreateMaintenanceTaskRequest(room1.getId(), "Issue");
        assertThrows(IllegalStateException.class, () -> {
            maintenanceService.createTask(createReq, false);
        });
    }

    @Test
    void maintenanceHandoffFromCleaning() {
        authenticateAs(adminUser);

        room1.setStatus(RoomStatus.CLEANING);
        roomRepository.save(room1);

        HousekeepingTask hkTask = new HousekeepingTask();
        hkTask.setRoom(room1);
        hkTask.setAssignedEmployee(employeeUser);
        hkTask.setStatus(HousekeepingStatus.IN_PROGRESS);
        housekeepingTaskRepository.save(hkTask);

        CreateMaintenanceTaskRequest createReq = new CreateMaintenanceTaskRequest(room1.getId(), "Issue");
        MaintenanceTaskResponse response = maintenanceService.createTask(createReq, false);

        assertThat(response.requiresHousekeepingAfterClose()).isTrue();

        HousekeepingTask updatedHk = housekeepingTaskRepository.findById(hkTask.getId()).orElseThrow();
        assertThat(updatedHk.getStatus()).isEqualTo(HousekeepingStatus.CANCELLED);

        Room updatedRoom = roomRepository.findById(room1.getId()).orElseThrow();
        assertThat(updatedRoom.getStatus()).isEqualTo(RoomStatus.MAINTENANCE);

        UpdateMaintenanceTaskStatusRequest startReq = new UpdateMaintenanceTaskStatusRequest(MaintenanceStatus.IN_PROGRESS, null);
        maintenanceService.updateTaskStatus(response.id(), startReq, false);

        UpdateMaintenanceTaskStatusRequest resolveReq = new UpdateMaintenanceTaskStatusRequest(MaintenanceStatus.RESOLVED, "Done");
        maintenanceService.updateTaskStatus(response.id(), resolveReq, false);

        Room finalRoom = roomRepository.findById(room1.getId()).orElseThrow();
        assertThat(finalRoom.getStatus()).isEqualTo(RoomStatus.CLEANING);

        List<HousekeepingTask> pendingHkTasks = housekeepingTaskRepository.findByRoom_IdAndStatusIn(room1.getId(), List.of(HousekeepingStatus.PENDING));
        assertThat(pendingHkTasks).hasSize(1);
    }
}

