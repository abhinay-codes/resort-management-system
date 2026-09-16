package com.paradiseresort.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AssignHousekeepingTaskRequest(

        @NotNull(message = "Employee ID is required.")
        @Positive(message = "Employee ID must be positive.")
        Long employeeId
) {
}