package com.paradiseresort.backend.dto;

import com.paradiseresort.backend.entity.MaintenanceStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateMaintenanceTaskStatusRequest(
        @NotNull(message = "Maintenance status is required.")
        MaintenanceStatus status,

        @Size(max = 1000, message = "Resolution note must not exceed 1000 characters.")
        String resolutionNote
) {}
