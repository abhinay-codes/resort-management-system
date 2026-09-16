package com.paradiseresort.backend.dto;

import com.paradiseresort.backend.entity.AppUser;
import com.paradiseresort.backend.security.Role;

public record UserResponse(
        Long id,
        String name,
        String email,
        Role role,
        boolean enabled
) {

    public static UserResponse from(
            AppUser user
    ) {

        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.isEnabled()
        );
    }
}