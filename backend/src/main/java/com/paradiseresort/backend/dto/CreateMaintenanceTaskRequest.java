package com.paradiseresort.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CreateMaintenanceTaskRequest(
        @NotNull(message = "Room ID is required.")
        @Positive(message = "Room ID must be positive.")
        Long roomId,

        @NotBlank(message = "Maintenance issue note is required.")
        @Size(max = 1000, message = "Maintenance issue note must not exceed 1000 characters.")
        String issueNote
) {}
