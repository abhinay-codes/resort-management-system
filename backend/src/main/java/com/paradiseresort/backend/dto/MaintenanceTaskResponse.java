package com.paradiseresort.backend.dto;

import com.paradiseresort.backend.entity.MaintenanceStatus;
import com.paradiseresort.backend.entity.MaintenanceTask;

import java.time.LocalDateTime;

public record MaintenanceTaskResponse(
        Long id,
        Long roomId,
        String roomName,
        String roomStatus,
        Long reportedById,
        String reportedByName,
        String reportedByEmail,
        Long assignedEmployeeId,
        String assignedEmployeeName,
        String assignedEmployeeEmail,
        MaintenanceStatus status,
        String issueNote,
        String resolutionNote,
        boolean requiresHousekeepingAfterClose,
        LocalDateTime createdAt,
        LocalDateTime startedAt,
        LocalDateTime completedAt
) {
    public static MaintenanceTaskResponse fromEntity(MaintenanceTask task) {
        var assignee = task.getAssignedEmployee();
        return new MaintenanceTaskResponse(
                task.getId(), task.getRoom().getId(), task.getRoom().getName(), task.getRoom().getStatus().name(),
                task.getReportedBy().getId(), task.getReportedBy().getName(), task.getReportedBy().getEmail(),
                assignee == null ? null : assignee.getId(),
                assignee == null ? null : assignee.getName(),
                assignee == null ? null : assignee.getEmail(),
                task.getStatus(), task.getIssueNote(), task.getResolutionNote(),
                task.isRequiresHousekeepingAfterClose(), task.getCreatedAt(), task.getStartedAt(), task.getCompletedAt()
        );
    }
}
