package com.paradiseresort.backend.dto;

import com.paradiseresort.backend.entity.AppUser;

public record EmployeeResponse(
        Long id,
        String name,
        String email,
        boolean enabled
) {

    public static EmployeeResponse fromEntity(AppUser user) {
        return new EmployeeResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.isEnabled()
        );
    }
}