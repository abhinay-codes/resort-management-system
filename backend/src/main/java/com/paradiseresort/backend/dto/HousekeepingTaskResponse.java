package com.paradiseresort.backend.dto;

import com.paradiseresort.backend.entity.HousekeepingStatus;
import com.paradiseresort.backend.entity.HousekeepingTask;

import java.time.LocalDateTime;

public record HousekeepingTaskResponse(

        Long id,

        Long roomId,
        String roomName,
        String roomStatus,

        Long employeeId,
        String employeeName,
        String employeeEmail,

        HousekeepingStatus status,

        LocalDateTime createdAt,
        LocalDateTime completedAt,

        String notes
) {

    public static HousekeepingTaskResponse fromEntity(
            HousekeepingTask task
    ) {

        return new HousekeepingTaskResponse(

                task.getId(),

                task.getRoom().getId(),
                task.getRoom().getName(),
                task.getRoom().getStatus().name(),

                task.getAssignedEmployee().getId(),
                task.getAssignedEmployee().getName(),
                task.getAssignedEmployee().getEmail(),

                task.getStatus(),

                task.getCreatedAt(),
                task.getCompletedAt(),

                task.getNotes()
        );
    }
}