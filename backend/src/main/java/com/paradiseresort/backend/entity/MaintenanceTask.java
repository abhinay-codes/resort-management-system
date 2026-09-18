package com.paradiseresort.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_tasks", indexes = {
        @Index(name = "idx_maintenance_room_status", columnList = "room_id,status"),
        @Index(name = "idx_maintenance_employee_status", columnList = "assigned_employee_id,status")
})
public class MaintenanceTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reported_by_id", nullable = false)
    private AppUser reportedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_employee_id")
    private AppUser assignedEmployee;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MaintenanceStatus status = MaintenanceStatus.OPEN;

    @Column(nullable = false, length = 1000)
    private String issueNote;

    @Column(length = 1000)
    private String resolutionNote;

    @Column(nullable = false)
    private boolean requiresHousekeepingAfterClose;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = MaintenanceStatus.OPEN;
        }
    }

    public Long getId() { return id; }
    public Room getRoom() { return room; }
    public void setRoom(Room room) { this.room = room; }
    public AppUser getReportedBy() { return reportedBy; }
    public void setReportedBy(AppUser reportedBy) { this.reportedBy = reportedBy; }
    public AppUser getAssignedEmployee() { return assignedEmployee; }
    public void setAssignedEmployee(AppUser assignedEmployee) { this.assignedEmployee = assignedEmployee; }
    public MaintenanceStatus getStatus() { return status; }
    public void setStatus(MaintenanceStatus status) { this.status = status; }
    public String getIssueNote() { return issueNote; }
    public void setIssueNote(String issueNote) { this.issueNote = issueNote; }
    public String getResolutionNote() { return resolutionNote; }
    public void setResolutionNote(String resolutionNote) { this.resolutionNote = resolutionNote; }
    public boolean isRequiresHousekeepingAfterClose() { return requiresHousekeepingAfterClose; }
    public void setRequiresHousekeepingAfterClose(boolean value) { this.requiresHousekeepingAfterClose = value; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}
