package com.paradiseresort.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CreateHousekeepingTaskRequest(

        @NotNull(message = "Room ID is required.")
        @Positive(message = "Room ID must be positive.")
        Long roomId,

        @NotNull(message = "Employee ID is required.")
        @Positive(message = "Employee ID must be positive.")
        Long employeeId,

        String notes
) {
}