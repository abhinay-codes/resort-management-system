package com.paradiseresort.backend.logging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class BookingLogger {

    private static final Logger logger =
            LoggerFactory.getLogger(BookingLogger.class);

    public void bookingCreated(
            Long bookingId,
            Long roomId
    ) {
        logger.info(
                "Booking created successfully. bookingId={}, roomId={}",
                bookingId,
                roomId
        );
    }

    public void bookingStatusChanged(
            Long bookingId,
            String oldStatus,
            String newStatus
    ) {
        logger.info(
                "Booking status changed. bookingId={}, from={}, to={}",
                bookingId,
                oldStatus,
                newStatus
        );
    }

    public void bookingCreationRejected(
            Long roomId,
            String reason
    ) {
        logger.warn(
                "Booking creation rejected. roomId={}, reason={}",
                roomId,
                reason
        );
    }
}