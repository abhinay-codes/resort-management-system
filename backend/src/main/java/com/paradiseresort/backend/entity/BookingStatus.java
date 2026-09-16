package com.paradiseresort.backend.entity;


/*
 * All valid states of a booking.
 *
 * Using an enum prevents invalid status values
 * from being accidentally created in Java code.
 */
public enum BookingStatus {

    PENDING,

    CONFIRMED,

    CANCELLED,

    CHECKED_IN,

    CHECKED_OUT
}