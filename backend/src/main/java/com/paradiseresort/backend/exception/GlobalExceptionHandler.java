package com.paradiseresort.backend.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.http.converter.HttpMessageNotReadableException;

import org.springframework.web.bind.MethodArgumentNotValidException;

import org.springframework.web.bind.MissingServletRequestParameterException;

import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.LocalDateTime;
import java.util.stream.Collectors;


@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger =
            LoggerFactory.getLogger(
                    GlobalExceptionHandler.class
            );


    /*
     * ==========================================
     * ILLEGAL ARGUMENT
     * ==========================================
     *
     * Used for business/input errors such as:
     *
     * - Room not found
     * - Booking not found
     * - Invalid ID
     * - Invalid dates
     * - Missing email
     */
    @ExceptionHandler(
            IllegalArgumentException.class
    )
    public ResponseEntity<ApiError> handleIllegalArgument(
            IllegalArgumentException error
    ) {

        ApiError response =
                new ApiError(
                        HttpStatus.BAD_REQUEST.value(),
                        safeMessage(
                                error.getMessage(),
                                "Invalid request."
                        ),
                        LocalDateTime.now()
                );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }


    /*
     * ==========================================
     * ILLEGAL STATE
     * ==========================================
     *
     * Used when the request itself may be valid,
     * but the current application state does not
     * allow the operation.
     *
     * Example:
     *
     * PENDING → CHECKED_OUT
     *
     * or:
     *
     * Room already booked.
     */
    @ExceptionHandler(
            IllegalStateException.class
    )
    public ResponseEntity<ApiError> handleIllegalState(
            IllegalStateException error
    ) {

        ApiError response =
                new ApiError(
                        HttpStatus.CONFLICT.value(),
                        safeMessage(
                                error.getMessage(),
                                "The requested operation cannot be completed."
                        ),
                        LocalDateTime.now()
                );

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(response);
    }


    /*
     * ==========================================
     * VALIDATION ERRORS
     * ==========================================
     *
     * Handles:
     *
     * @NotBlank
     * @Email
     * @Future
     * @Min
     * @Size
     * etc.
     */
    @ExceptionHandler(
            MethodArgumentNotValidException.class
    )
    public ResponseEntity<ApiError> handleValidation(
            MethodArgumentNotValidException error
    ) {

        String message =
                error.getBindingResult()
                        .getFieldErrors()
                        .stream()
                        .map(fieldError ->
                                fieldError.getField()
                                + ": "
                                + fieldError.getDefaultMessage()
                        )
                        .collect(
                                Collectors.joining(" ")
                        );

        if (message.isBlank()) {
            message = "Invalid request data.";
        }

        ApiError response =
                new ApiError(
                        HttpStatus.BAD_REQUEST.value(),
                        message,
                        LocalDateTime.now()
                );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }


    /*
     * ==========================================
     * INVALID PARAMETER TYPE
     * ==========================================
     *
     * Handles things such as:
     *
     * status=HELLO
     *
     * when Spring expects BookingStatus.
     *
     * Also handles invalid numeric/date parameters.
     */
    @ExceptionHandler(
            MethodArgumentTypeMismatchException.class
    )
    public ResponseEntity<ApiError> handleTypeMismatch(
            MethodArgumentTypeMismatchException error
    ) {

        String message =
                "Invalid value for parameter '"
                + error.getName()
                + "'.";

        ApiError response =
                new ApiError(
                        HttpStatus.BAD_REQUEST.value(),
                        message,
                        LocalDateTime.now()
                );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }


    /*
     * ==========================================
     * MISSING REQUEST PARAMETER
     * ==========================================
     *
     * Example:
     *
     * GET /api/bookings/5
     *
     * without:
     *
     * ?email=...
     */
    @ExceptionHandler(
            MissingServletRequestParameterException.class
    )
    public ResponseEntity<ApiError> handleMissingParameter(
            MissingServletRequestParameterException error
    ) {

        String message =
                "Required parameter '"
                + error.getParameterName()
                + "' is missing.";

        ApiError response =
                new ApiError(
                        HttpStatus.BAD_REQUEST.value(),
                        message,
                        LocalDateTime.now()
                );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }


    /*
     * ==========================================
     * MALFORMED JSON / REQUEST BODY
     * ==========================================
     *
     * Example:
     *
     * {
     *     "guestName":
     *
     * Invalid JSON should not expose Jackson's
     * internal parsing details to the client.
     */
    @ExceptionHandler(
            HttpMessageNotReadableException.class
    )
    public ResponseEntity<ApiError> handleUnreadableRequest(
            HttpMessageNotReadableException error
    ) {

        ApiError response =
                new ApiError(
                        HttpStatus.BAD_REQUEST.value(),
                        "Invalid request body.",
                        LocalDateTime.now()
                );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }


    /*
     * ==========================================
     * DATABASE CONSTRAINT ERROR
     * ==========================================
     *
     * Handles database-level constraint failures.
     *
     * We do not expose SQL/database details.
     */
    @ExceptionHandler(
            DataIntegrityViolationException.class
    )
    public ResponseEntity<ApiError> handleDataIntegrityViolation(
            DataIntegrityViolationException error
    ) {

        logger.error(
                "Database constraint violation.",
                error
        );

        ApiError response =
                new ApiError(
                        HttpStatus.CONFLICT.value(),
                        "The request conflicts with existing data.",
                        LocalDateTime.now()
                );

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(response);
    }


    /*
     * ==========================================
     * UNEXPECTED ERRORS
     * ==========================================
     *
     * The actual exception is logged on the server.
     *
     * The client receives only a safe generic
     * message.
     */
    @ExceptionHandler(
            Exception.class
    )
    public ResponseEntity<ApiError> handleUnexpectedException(
            Exception error
    ) {

        logger.error(
                "Unexpected server error.",
                error
        );

        ApiError response =
                new ApiError(
                        HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        "An unexpected error occurred.",
                        LocalDateTime.now()
                );

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(response);
    }


    /*
     * ==========================================
     * SAFE ERROR MESSAGE
     * ==========================================
     *
     * Prevents a null exception message from
     * producing a useless JSON response.
     */
    private String safeMessage(
            String message,
            String fallback
    ) {

        if (message == null ||
                message.isBlank()) {

            return fallback;
        }

        return message;
    }
}