package com.paradiseresort.backend.service;

import com.paradiseresort.backend.dto.NotificationResponse;
import com.paradiseresort.backend.entity.AppUser;
import com.paradiseresort.backend.entity.Booking;
import com.paradiseresort.backend.entity.Notification;
import com.paradiseresort.backend.entity.NotificationType;
import com.paradiseresort.backend.repository.AppUserRepository;
import com.paradiseresort.backend.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final AppUserRepository userRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            AppUserRepository userRepository
    ) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    /*
     * ==========================================
     * CREATE NOTIFICATION (INTERNAL EVENT)
     * ==========================================
     *
     * refundProcessed indicates whether a refund was actually
     * completed/initiated in the cancellation flow.
     */
    @Transactional
    public boolean createNotification(Booking booking, NotificationType type, boolean refundProcessed) {
        if (booking.getCustomer() == null) {
            return false;
        }

        String idempotencyKey = type.name() + "_" + booking.getId();
        if (notificationRepository.existsByIdempotencyKey(idempotencyKey)) {
            return false;
        }

        Notification notification = new Notification();
        notification.setCustomer(booking.getCustomer());
        notification.setType(type);
        notification.setBooking(booking);
        notification.setIdempotencyKey(idempotencyKey);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRead(false);

        switch (type) {
            case BOOKING_CREATED -> {
                notification.setTitle("Booking Received");
                notification.setMessage("Your booking for " + booking.getRoom().getName()
                        + " (Check-in: " + booking.getCheckIn() + ") has been received. "
                        + "Please complete the payment of INR " + booking.getTotalAmount() + " to confirm.");
            }
            case BOOKING_CONFIRMED -> {
                notification.setTitle("Booking Confirmed");
                notification.setMessage("Your booking for " + booking.getRoom().getName()
                        + " is confirmed! Check-in: " + booking.getCheckIn()
                        + ", Check-out: " + booking.getCheckOut() + ".");
            }
            case BOOKING_CANCELLED -> {
                notification.setTitle("Booking Cancelled");
                if (refundProcessed) {
                    notification.setMessage("Your booking for " + booking.getRoom().getName()
                            + " has been cancelled and a refund has been initiated for your payment.");
                } else {
                    notification.setMessage("Your booking for " + booking.getRoom().getName()
                            + " has been cancelled.");
                }
            }
            case CHECK_IN_REMINDER -> {
                notification.setTitle("Upcoming Check-in Reminder");
                notification.setMessage("Reminder: Your stay at " + booking.getRoom().getName()
                        + " begins on " + booking.getCheckIn() + ". We look forward to welcoming you!");
            }
        }

        notificationRepository.save(notification);
        return true;
    }

    /*
     * Convenience method when refund status is not applicable (e.g. created, confirmed, reminder).
     */
    @Transactional
    public boolean createNotification(Booking booking, NotificationType type) {
        return createNotification(booking, type, false);
    }

    /*
     * ==========================================
     * CUSTOMER API - GET MY NOTIFICATIONS
     * ==========================================
     */
    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(String email, boolean unreadOnly) {
        AppUser customer = getCustomerByEmail(email);
        List<Notification> notifications;
        
        if (unreadOnly) {
            notifications = notificationRepository.findByCustomer_IdAndReadFalseOrderByCreatedAtDesc(customer.getId());
        } else {
            notifications = notificationRepository.findByCustomer_IdOrderByCreatedAtDesc(customer.getId());
        }
        
        return notifications.stream().map(NotificationResponse::fromEntity).toList();
    }

    /*
     * ==========================================
     * CUSTOMER API - GET UNREAD COUNT
     * ==========================================
     */
    @Transactional(readOnly = true)
    public long getUnreadCount(String email) {
        AppUser customer = getCustomerByEmail(email);
        return notificationRepository.countByCustomer_IdAndReadFalse(customer.getId());
    }

    /*
     * ==========================================
     * CUSTOMER API - MARK AS READ
     * ==========================================
     */
    @Transactional
    public void markAsRead(Long notificationId, String email) {
        AppUser customer = getCustomerByEmail(email);
        Notification notification = notificationRepository.findByIdAndCustomer_Id(notificationId, customer.getId())
                .orElseThrow(() -> new IllegalArgumentException("Notification not found."));
        
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    /*
     * ==========================================
     * CUSTOMER API - MARK ALL AS READ
     * ==========================================
     */
    @Transactional
    public void markAllAsRead(String email) {
        AppUser customer = getCustomerByEmail(email);
        notificationRepository.markAllAsReadByCustomerId(customer.getId());
    }

    private AppUser getCustomerByEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required.");
        }
        AppUser user = userRepository.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new IllegalArgumentException("Customer account not found."));
        if (user.getRole() == null || !user.getRole().name().equals("CUSTOMER")) {
            throw new IllegalArgumentException("Only customers can access notifications.");
        }
        if (!user.isEnabled()) {
            throw new IllegalStateException("Customer account is disabled.");
        }
        return user;
    }
}

