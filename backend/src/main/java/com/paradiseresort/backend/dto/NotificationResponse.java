package com.paradiseresort.backend.dto;

import com.paradiseresort.backend.entity.Notification;
import com.paradiseresort.backend.entity.NotificationType;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        NotificationType type,
        String title,
        String message,
        Long bookingId,
        boolean read,
        LocalDateTime createdAt
) {
    public static NotificationResponse fromEntity(Notification notification) {
        Long bookingId = notification.getBooking() != null ? notification.getBooking().getId() : null;
        return new NotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getTitle(),
                notification.getMessage(),
                bookingId,
                notification.isRead(),
                notification.getCreatedAt()
        );
    }
}

