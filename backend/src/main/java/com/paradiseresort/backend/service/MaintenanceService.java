package com.paradiseresort.backend.service;

import com.paradiseresort.backend.dto.AssignMaintenanceTaskRequest;
import com.paradiseresort.backend.dto.CreateMaintenanceTaskRequest;
import com.paradiseresort.backend.dto.MaintenanceTaskResponse;
import com.paradiseresort.backend.dto.UpdateMaintenanceTaskStatusRequest;
import com.paradiseresort.backend.dto.UpdateRoomMaintenanceRequest;
import com.paradiseresort.backend.entity.*;
import com.paradiseresort.backend.repository.*;
import com.paradiseresort.backend.security.Role;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class MaintenanceService {

    private final RoomRepository roomRepository;
    private final RoomStateService roomStateService;
    private final MaintenanceTaskRepository maintenanceTaskRepository;
    private final HousekeepingTaskRepository housekeepingTaskRepository;
    private final BookingRepository bookingRepository;
    private final AppUserRepository userRepository;

    public MaintenanceService(
            RoomRepository roomRepository,
            RoomStateService roomStateService,
            MaintenanceTaskRepository maintenanceTaskRepository,
            HousekeepingTaskRepository housekeepingTaskRepository,
            BookingRepository bookingRepository,
            AppUserRepository userRepository
    ) {
        this.roomRepository = roomRepository;
        this.roomStateService = roomStateService;
        this.maintenanceTaskRepository = maintenanceTaskRepository;
        this.housekeepingTaskRepository = housekeepingTaskRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    /*
     * ==========================================
     * ADMIN - GET MAINTENANCE ROOMS
     * ==========================================
     */

    @Transactional(readOnly = true)
    public List<Room> getMaintenanceRooms() {

        return roomRepository
                .findAll()
                .stream()
                .filter(room ->
                        room.getStatus() == RoomStatus.MAINTENANCE
                )
                .toList();
    }

    /*
     * ==========================================
     * REPORT MAINTENANCE (legacy room-level API)
     * ==========================================
     */

    @Transactional
    public Room reportMaintenance(
            Long roomId,
            UpdateRoomMaintenanceRequest request
    ) {

        validateId(roomId);

        if (request == null) {
            throw new IllegalArgumentException(
                    "Maintenance request is required."
            );
        }

        if (
                request.note() == null
                || request.note().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Maintenance note is required."
            );
        }

        Room room =
                roomRepository.findById(roomId)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Room not found."
                                )
                        );

        if (room.getStatus() == RoomStatus.OCCUPIED) {
            throw new IllegalStateException(
                    "Occupied rooms cannot be placed into maintenance."
            );
        }

        if (room.getStatus() == RoomStatus.CLEANING) {
            throw new IllegalStateException(
                    "A room currently being cleaned cannot be placed into maintenance."
            );
        }

        if (room.getStatus() == RoomStatus.MAINTENANCE) {
            return room;
        }

        return roomStateService.transition(
                roomId,
                RoomStatus.MAINTENANCE
        );
    }

    /*
     * ==========================================
     * RESOLVE MAINTENANCE (legacy room-level API)
     * ==========================================
     */

    @Transactional
    public Room resolveMaintenance(
            Long roomId
    ) {

        validateId(roomId);

        Room room =
                roomRepository.findById(roomId)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Room not found."
                                )
                        );

        if (room.getStatus() != RoomStatus.MAINTENANCE) {
            throw new IllegalStateException(
                    "Room is not currently under maintenance."
            );
        }

        return roomStateService.transition(
                roomId,
                RoomStatus.AVAILABLE
        );
    }

    /*
     * ==========================================
     * CREATE MAINTENANCE TASK
     * ==========================================
     *
     * Creates a maintenance task for a room.
     *
     * isEmployeeReport = true means the caller is
     * an employee reporting an issue; the task is
     * auto-assigned to that employee.
     *
     * isEmployeeReport = false means the caller is
     * an admin; the task may remain unassigned.
     *
     * CLEANING → MAINTENANCE hand-off:
     *   - Active housekeeping task is cancelled
     *   - Room transitions to MAINTENANCE
     *   - requiresHousekeepingAfterClose is forced true
     *
     * Booking conflict:
     *   - Rejects if the room has a PENDING or
     *     CONFIRMED booking with checkout after today.
     */

    @Transactional
    public MaintenanceTaskResponse createTask(
            CreateMaintenanceTaskRequest request,
            boolean isEmployeeReport
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Maintenance task request is required."
            );
        }

        validateId(request.roomId());

        Room room = roomRepository.findById(request.roomId())
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Room not found."
                        )
                );

        /*
         * Occupied rooms cannot enter maintenance.
         */
        if (room.getStatus() == RoomStatus.OCCUPIED) {
            throw new IllegalStateException(
                    "Occupied rooms cannot be placed into maintenance."
            );
        }

        /*
         * Booking conflict check:
         * Reject if any PENDING or CONFIRMED booking
         * has checkout after today.
         */
        boolean hasConflict =
                bookingRepository.existsActiveBookingWithCheckoutAfter(
                        room.getId(),
                        List.of(
                                BookingStatus.PENDING,
                                BookingStatus.CONFIRMED
                        ),
                        LocalDate.now()
                );

        if (hasConflict) {
            throw new IllegalStateException(
                    "Cannot create maintenance task: room has an active or upcoming booking."
            );
        }

        /*
         * Determine if this is a CLEANING → MAINTENANCE
         * hand-off scenario.
         */
        boolean forceHousekeepingAfterClose = false;

        if (room.getStatus() == RoomStatus.CLEANING) {
            /*
             * Cancel the active housekeeping task(s)
             * for this room. Do NOT use the public
             * housekeeping cancellation path because
             * that transitions CLEANING → AVAILABLE.
             * We need CLEANING → MAINTENANCE instead.
             */
            List<HousekeepingTask> activeHkTasks =
                    housekeepingTaskRepository.findByRoom_IdAndStatusIn(
                            room.getId(),
                            List.of(
                                    HousekeepingStatus.PENDING,
                                    HousekeepingStatus.IN_PROGRESS
                            )
                    );

            for (HousekeepingTask hkTask : activeHkTasks) {
                hkTask.setStatus(HousekeepingStatus.CANCELLED);
                housekeepingTaskRepository.save(hkTask);
            }

            /*
             * Transition room: CLEANING → MAINTENANCE
             */
            roomStateService.transition(
                    room.getId(),
                    RoomStatus.MAINTENANCE
            );

            forceHousekeepingAfterClose = true;

        } else if (room.getStatus() != RoomStatus.MAINTENANCE) {
            /*
             * For AVAILABLE or BOOKED rooms, transition
             * to MAINTENANCE.
             */
            roomStateService.transition(
                    room.getId(),
                    RoomStatus.MAINTENANCE
            );
        }

        /*
         * Resolve the reporting user from the
         * security context.
         */
        String email = getCurrentUserEmail();

        AppUser reportedBy = userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(
                        () -> new IllegalStateException(
                                "Authenticated user not found."
                        )
                );

        /*
         * Build the maintenance task entity.
         */
        MaintenanceTask task = new MaintenanceTask();
        task.setRoom(room);
        task.setReportedBy(reportedBy);
        task.setIssueNote(request.issueNote());
        task.setStatus(MaintenanceStatus.OPEN);
        task.setRequiresHousekeepingAfterClose(
                forceHousekeepingAfterClose
        );

        /*
         * Employee-reported tasks are auto-assigned
         * to the reporting employee.
         */
        if (isEmployeeReport) {
            task.setAssignedEmployee(reportedBy);
        }

        MaintenanceTask savedTask =
                maintenanceTaskRepository.save(task);

        return MaintenanceTaskResponse.fromEntity(savedTask);
    }

    /*
     * ==========================================
     * ASSIGN MAINTENANCE TASK
     * ==========================================
     *
     * Assigns an employee to an OPEN maintenance
     * task. Uses pessimistic locking.
     */

    @Transactional
    public MaintenanceTaskResponse assignTask(
            Long taskId,
            AssignMaintenanceTaskRequest request
    ) {

        if (taskId == null || taskId <= 0) {
            throw new IllegalArgumentException(
                    "Task ID must be a positive number."
            );
        }

        if (request == null) {
            throw new IllegalArgumentException(
                    "Assignment request is required."
            );
        }

        MaintenanceTask task =
                maintenanceTaskRepository.findByIdForUpdate(taskId)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Maintenance task not found."
                                )
                        );

        if (task.getStatus() != MaintenanceStatus.OPEN) {
            throw new IllegalStateException(
                    "Only OPEN tasks can be assigned."
            );
        }

        AppUser employee = userRepository
                .findById(request.employeeId())
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Employee not found."
                        )
                );

        if (employee.getRole() != Role.EMPLOYEE) {
            throw new IllegalArgumentException(
                    "The assigned user must be an employee."
            );
        }

        if (!employee.isEnabled()) {
            throw new IllegalStateException(
                    "This employee account is disabled."
            );
        }

        task.setAssignedEmployee(employee);

        MaintenanceTask savedTask =
                maintenanceTaskRepository.save(task);

        return MaintenanceTaskResponse.fromEntity(savedTask);
    }

    /*
     * ==========================================
     * UPDATE MAINTENANCE TASK STATUS
     * ==========================================
     *
     * Allowed transitions:
     *
     * OPEN → IN_PROGRESS
     * IN_PROGRESS → RESOLVED
     * OPEN → CANCELLED
     * IN_PROGRESS → CANCELLED
     *
     * RESOLVED is terminal.
     *
     * When transitioning to RESOLVED:
     *   - If requiresHousekeepingAfterClose is true:
     *       MAINTENANCE → CLEANING
     *       Create new PENDING housekeeping task.
     *   - Otherwise:
     *       MAINTENANCE → AVAILABLE
     *
     * isEmployeeUpdate = true restricts updates
     * to the assigned employee only.
     */

    @Transactional
    public MaintenanceTaskResponse updateTaskStatus(
            Long taskId,
            UpdateMaintenanceTaskStatusRequest request,
            boolean isEmployeeUpdate
    ) {

        if (taskId == null || taskId <= 0) {
            throw new IllegalArgumentException(
                    "Task ID must be a positive number."
            );
        }

        if (request == null || request.status() == null) {
            throw new IllegalArgumentException(
                    "Maintenance status is required."
            );
        }

        MaintenanceTask task =
                maintenanceTaskRepository.findByIdForUpdate(taskId)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Maintenance task not found."
                                )
                        );

        /*
         * Employee authorization: employees can only
         * update tasks assigned to them.
         */
        if (isEmployeeUpdate) {
            String email = getCurrentUserEmail();

            AppUser assignee = task.getAssignedEmployee();

            if (assignee == null
                    || !assignee.getEmail()
                            .equalsIgnoreCase(email)
            ) {
                throw new IllegalStateException(
                        "You can only update tasks assigned to you."
                );
            }
        }

        MaintenanceStatus currentStatus = task.getStatus();
        MaintenanceStatus targetStatus = request.status();

        validateStatusTransition(
                currentStatus,
                targetStatus
        );

        task.setStatus(targetStatus);

        /*
         * Record timestamps.
         */
        if (targetStatus == MaintenanceStatus.IN_PROGRESS) {
            task.setStartedAt(LocalDateTime.now());
        }

        if (targetStatus == MaintenanceStatus.RESOLVED) {
            task.setCompletedAt(LocalDateTime.now());

            if (request.resolutionNote() != null
                    && !request.resolutionNote().isBlank()
            ) {
                task.setResolutionNote(
                        request.resolutionNote().trim()
                );
            }

            /*
             * Room state transition on resolution.
             */
            Room room = task.getRoom();

            if (task.isRequiresHousekeepingAfterClose()) {
                /*
                 * MAINTENANCE → CLEANING
                 * Create a fresh PENDING housekeeping task.
                 */
                roomStateService.transition(
                        room.getId(),
                        RoomStatus.CLEANING
                );

                HousekeepingTask hkTask =
                        new HousekeepingTask();
                hkTask.setRoom(room);

                /*
                 * Assign the housekeeping task to the
                 * maintenance assignee if available,
                 * otherwise to the reporter.
                 */
                AppUser hkAssignee =
                        task.getAssignedEmployee() != null
                                ? task.getAssignedEmployee()
                                : task.getReportedBy();

                hkTask.setAssignedEmployee(hkAssignee);
                hkTask.setStatus(HousekeepingStatus.PENDING);

                housekeepingTaskRepository.save(hkTask);

            } else {
                /*
                 * MAINTENANCE → AVAILABLE
                 */
                roomStateService.transition(
                        room.getId(),
                        RoomStatus.AVAILABLE
                );
            }
        }

        if (targetStatus == MaintenanceStatus.CANCELLED) {
            task.setCompletedAt(LocalDateTime.now());

            if (request.resolutionNote() != null
                    && !request.resolutionNote().isBlank()
            ) {
                task.setResolutionNote(
                        request.resolutionNote().trim()
                );
            }

            /*
             * On cancellation, return the room to
             * AVAILABLE if it is still in MAINTENANCE.
             */
            Room room = task.getRoom();

            if (room.getStatus() == RoomStatus.MAINTENANCE) {
                roomStateService.transition(
                        room.getId(),
                        RoomStatus.AVAILABLE
                );
            }
        }

        MaintenanceTask savedTask =
                maintenanceTaskRepository.save(task);

        return MaintenanceTaskResponse.fromEntity(savedTask);
    }

    /*
     * ==========================================
     * STATUS TRANSITION VALIDATION
     * ==========================================
     *
     * OPEN → IN_PROGRESS
     * OPEN → CANCELLED
     * IN_PROGRESS → RESOLVED
     * IN_PROGRESS → CANCELLED
     *
     * RESOLVED and CANCELLED are terminal.
     */

    private void validateStatusTransition(
            MaintenanceStatus current,
            MaintenanceStatus target
    ) {

        boolean allowed = switch (current) {

            case OPEN ->
                    target == MaintenanceStatus.IN_PROGRESS
                    || target == MaintenanceStatus.CANCELLED;

            case IN_PROGRESS ->
                    target == MaintenanceStatus.RESOLVED
                    || target == MaintenanceStatus.CANCELLED;

            case RESOLVED, CANCELLED -> false;
        };

        if (!allowed) {
            throw new IllegalStateException(
                    "Invalid maintenance status transition: "
                            + current + " -> " + target
            );
        }
    }

    /*
     * ==========================================
     * CURRENT USER
     * ==========================================
     */

    private String getCurrentUserEmail() {

        if (
                SecurityContextHolder
                        .getContext()
                        .getAuthentication() == null
        ) {
            throw new IllegalStateException(
                    "Authentication is required."
            );
        }

        String email =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        if (email == null || email.isBlank()) {
            throw new IllegalStateException(
                    "Authenticated user email is unavailable."
            );
        }

        return email;
    }

    /*
     * ==========================================
     * VALIDATION
     * ==========================================
     */

    private void validateId(Long roomId) {

        if (roomId == null || roomId <= 0) {
            throw new IllegalArgumentException(
                    "Room ID must be a positive number."
            );
        }
    }
}