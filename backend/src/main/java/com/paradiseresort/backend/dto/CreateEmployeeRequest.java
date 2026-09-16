package com.paradiseresort.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;


/*
 * Request body used when an administrator
 * creates a new employee account.
 *
 * These validations are enforced by the backend.
 *
 * The frontend may also validate these fields,
 * but backend validation is the actual security
 * boundary.
 */
public record CreateEmployeeRequest(

        /*
         * Employee name cannot be empty.
         */
        @NotBlank(
                message = "Name is required."
        )
        @Size(
                max = 100,
                message = "Name must not exceed 100 characters."
        )
        String name,


        /*
         * Email must be present and correctly formatted.
         */
        @NotBlank(
                message = "Email is required."
        )
        @Email(
                message = "Please provide a valid email address."
        )
        @Size(
                max = 255,
                message = "Email must not exceed 255 characters."
        )
        String email,


        /*
         * Password must have at least 8 characters.
         *
         * We deliberately do NOT impose an overly
         * complicated password rule here.
         *
         * Passwords are still stored as BCrypt hashes,
         * never as plain text.
         */
        @NotBlank(
                message = "Password is required."
        )
        @Size(
                min = 8,
                max = 100,
                message = "Password must be between 8 and 100 characters."
        )
        String password

) {
}