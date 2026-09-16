package com.paradiseresort.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateRoomMaintenanceRequest(

        @NotBlank(message = "Maintenance note is required.")
        String note

) {
}