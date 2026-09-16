package com.paradiseresort.backend.service;

import com.paradiseresort.backend.dto.AssignHousekeepingTaskRequest;
import com.paradiseresort.backend.dto.CreateHousekeepingTaskRequest;
import com.paradiseresort.backend.dto.HousekeepingTaskResponse;
import com.paradiseresort.backend.entity.AppUser;
import com.paradiseresort.backend.entity.HousekeepingStatus;
import com.paradiseresort.backend.entity.HousekeepingTask;
import com.paradiseresort.backend.entity.Room;
import com.paradiseresort.backend.entity.RoomStatus;
import com.paradiseresort.backend.repository.AppUserRepository;
import com.paradiseresort.backend.repository.HousekeepingTaskRepository;
import com.paradiseresort.backend.repository.RoomRepository;
import com.paradiseresort.backend.security.Role;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class HousekeepingService {

    private final HousekeepingTaskRepository housekeepingTaskRepository;
    private final RoomRepository roomRepository;
    private final AppUserRepository userRepository;
    private final RoomStateService roomStateService;

    public HousekeepingService(
            HousekeepingTaskRepository housekeepingTaskRepository,
            RoomRepository roomRepository,
            AppUserRepository userRepository,
            RoomStateService roomStateService
    ) {
        this.housekeepingTaskRepository = housekeepingTaskRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.roomStateService = roomStateService;
    }

    /*
     * ==========================================
     * ADMIN - GET ALL TASKS
     * ==========================================
     */

    @Transactional(readOnly = true)
    public List<HousekeepingTaskResponse> getAllTasks() {

        return housekeepingTaskRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(HousekeepingTaskResponse::fromEntity)
                .toList();
    }

    /*
     * ==========================================
     * ADMIN - CREATE TASK
     * ==========================================
     */

    @Transactional
    public HousekeepingTaskResponse createTask(
            CreateHousekeepingTaskRequest request
    ) {

        validateId(request.roomId(), "Room ID");
        validateId(request.employeeId(), "Employee ID");

        Room room = roomRepository
                .findById(request.roomId())
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Room not found."
                        )
                );

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

        if (
                room.getStatus() != RoomStatus.AVAILABLE
                        && room.getStatus() != RoomStatus.CLEANING
        ) {
            throw new IllegalStateException(
                    "Housekeeping can only be created for an available or cleaning room."
            );
        }

        /*
         * A room should not have multiple unfinished
         * housekeeping tasks at the same time.
         */
        boolean unfinishedTaskExists =
                housekeepingTaskRepository
                        .existsByRoom_IdAndStatusIn(
                                room.getId(),
                                List.of(
                                        HousekeepingStatus.PENDING,
                                        HousekeepingStatus.IN_PROGRESS
                                )
                        );

        if (unfinishedTaskExists) {
            throw new IllegalStateException(
                    "This room already has an unfinished housekeeping task."
            );
        }

        /*
         * Room state transition:
         *
         * AVAILABLE/CLEANING → CLEANING
         *
         * RoomStateService allows the transition to be
         * validated centrally.
         */
        if (room.getStatus() == RoomStatus.AVAILABLE) {
            roomStateService.transition(
                    room.getId(),
                    RoomStatus.CLEANING
            );
        }

        HousekeepingTask task =
                new HousekeepingTask();

        task.setRoom(room);
        task.setAssignedEmployee(employee);
        task.setStatus(HousekeepingStatus.PENDING);

        String notes = request.notes();

        if (notes != null && !notes.isBlank()) {
            task.setNotes(notes.trim());
        }

        HousekeepingTask savedTask =
                housekeepingTaskRepository.save(task);

        return HousekeepingTaskResponse.fromEntity(savedTask);
    }

    /*
     * ==========================================
     * ADMIN - REASSIGN TASK
     * ==========================================
     */

    @Transactional
    public HousekeepingTaskResponse assignTask(
            Long taskId,
            AssignHousekeepingTaskRequest request
    ) {

        validateId(taskId, "Task ID");
        validateId(request.employeeId(), "Employee ID");

        HousekeepingTask task =
                getTaskEntity(taskId);

        if (
                task.getStatus() == HousekeepingStatus.COMPLETED
                        ||
                        task.getStatus() == HousekeepingStatus.CANCELLED
        ) {
            throw new IllegalStateException(
                    "Completed or cancelled tasks cannot be reassigned."
            );
        }

        AppUser employee =
                userRepository
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

        HousekeepingTask savedTask =
                housekeepingTaskRepository.save(task);

        return HousekeepingTaskResponse.fromEntity(savedTask);
    }

    /*
     * ==========================================
     * ADMIN - CANCEL TASK
     * ==========================================
     */

    @Transactional
    public HousekeepingTaskResponse cancelTask(
            Long taskId
    ) {

        validateId(taskId, "Task ID");

        HousekeepingTask task =
                getTaskEntity(taskId);

        if (
                task.getStatus() == HousekeepingStatus.COMPLETED
        ) {
            throw new IllegalStateException(
                    "Completed housekeeping tasks cannot be cancelled."
            );
        }

        if (
                task.getStatus() == HousekeepingStatus.CANCELLED
        ) {
            return HousekeepingTaskResponse.fromEntity(task);
        }

        task.setStatus(HousekeepingStatus.CANCELLED);
        task.setCompletedAt(null);

        Room room = task.getRoom();

        /*
         * If this task was responsible for cleaning the room,
         * cancelling it returns the room to AVAILABLE.
         */
        if (room.getStatus() == RoomStatus.CLEANING) {
            roomStateService.transition(
                    room.getId(),
                    RoomStatus.AVAILABLE
            );
        }

        HousekeepingTask savedTask =
                housekeepingTaskRepository.save(task);

        return HousekeepingTaskResponse.fromEntity(savedTask);
    }

    /*
     * ==========================================
     * EMPLOYEE - GET MY TASKS
     * ==========================================
     */

    @Transactional(readOnly = true)
    public List<HousekeepingTaskResponse> getMyTasks() {

        String email = getCurrentUserEmail();

        return housekeepingTaskRepository
                .findByAssignedEmployee_EmailIgnoreCaseOrderByCreatedAtDesc(
                        email
                )
                .stream()
                .map(HousekeepingTaskResponse::fromEntity)
                .toList();
    }

    /*
     * ==========================================
     * EMPLOYEE - UPDATE MY TASK STATUS
     * ==========================================
     */

    @Transactional
    public HousekeepingTaskResponse updateMyTaskStatus(
            Long taskId,
            HousekeepingStatus newStatus
    ) {

        validateId(taskId, "Task ID");

        if (newStatus == null) {
            throw new IllegalArgumentException(
                    "Housekeeping status is required."
            );
        }

        String email = getCurrentUserEmail();

        HousekeepingTask task =
                housekeepingTaskRepository
                        .findByIdAndAssignedEmployee_EmailIgnoreCase(
                                taskId,
                                email
                        )
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Housekeeping task not found."
                                )
                        );

        HousekeepingStatus currentStatus =
                task.getStatus();

        /*
         * Employee can only move:
         *
         * PENDING -> IN_PROGRESS
         * IN_PROGRESS -> COMPLETED
         */

        if (
                currentStatus == HousekeepingStatus.PENDING
                        &&
                        newStatus != HousekeepingStatus.IN_PROGRESS
        ) {
            throw new IllegalStateException(
                    "A pending task can only be started."
            );
        }

        if (
                currentStatus == HousekeepingStatus.IN_PROGRESS
                        &&
                        newStatus != HousekeepingStatus.COMPLETED
        ) {
            throw new IllegalStateException(
                    "An in-progress task can only be completed."
            );
        }

        if (
                currentStatus == HousekeepingStatus.COMPLETED
                        ||
                        currentStatus == HousekeepingStatus.CANCELLED
        ) {
            throw new IllegalStateException(
                    "This housekeeping task is already closed."
            );
        }

        task.setStatus(newStatus);

        if (newStatus == HousekeepingStatus.COMPLETED) {

            task.setCompletedAt(
                    LocalDateTime.now()
            );

            Room room = task.getRoom();

            /*
             * Room state transition:
             *
             * CLEANING → AVAILABLE
             */
            if (room.getStatus() == RoomStatus.CLEANING) {
                roomStateService.transition(
                        room.getId(),
                        RoomStatus.AVAILABLE
                );
            }
        }

        HousekeepingTask savedTask =
                housekeepingTaskRepository.save(task);

        return HousekeepingTaskResponse.fromEntity(savedTask);
    }

    /*
     * ==========================================
     * FIND TASK
     * ==========================================
     */

    @Transactional(readOnly = true)
    public HousekeepingTask getTaskEntity(
            Long taskId
    ) {

        validateId(taskId, "Task ID");

        return housekeepingTaskRepository
                .findById(taskId)
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Housekeeping task not found."
                        )
                );
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

    private void validateId(
            Long id,
            String fieldName
    ) {

        if (id == null || id <= 0) {
            throw new IllegalArgumentException(
                    fieldName + " must be a positive number."
            );
        }
    }
}