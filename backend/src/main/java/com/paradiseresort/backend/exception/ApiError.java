package com.paradiseresort.backend.exception;

import java.time.LocalDateTime;


/*
 * This class represents the standard
 * error response returned by our API.
 *
 * Instead of returning random strings such as:
 *
 * "Room not found."
 *
 * or
 *
 * "This room is not available..."
 *
 * the backend will return a consistent
 * JSON structure.
 */
public record ApiError(

        int status,

        String message,

        LocalDateTime timestamp

) {
}