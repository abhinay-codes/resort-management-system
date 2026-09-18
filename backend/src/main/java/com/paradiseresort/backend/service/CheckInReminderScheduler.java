package com.paradiseresort.backend.service;

import com.paradiseresort.backend.entity.Booking;
import com.paradiseresort.backend.entity.BookingStatus;
import com.paradiseresort.backend.entity.NotificationType;
import com.paradiseresort.backend.repository.BookingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class CheckInReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(CheckInReminderScheduler.class);

    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;
    
    @Value("${app.notifications.reminder.days-before:1}")
    private int daysBefore;

    public CheckInReminderScheduler(BookingRepository bookingRepository, NotificationService notificationService) {
        this.bookingRepository = bookingRepository;
        this.notificationService = notificationService;
    }

    /*
     * Default cron: 0 0 8 * * * (Every day at 8:00 AM)
     * For testing: fixedDelay can be used, or cron adjusted in application.properties
     */
    @Scheduled(cron = "${app.notifications.reminder.cron:0 0 8 * * *}")
    @Transactional
    public void processCheckInReminders() {
        LocalDate targetDate = LocalDate.now().plusDays(daysBefore);
        log.info("Processing check-in reminders for check-in date: {}", targetDate);
        
        List<Booking> eligibleBookings = bookingRepository.findByStatusAndCheckIn(BookingStatus.CONFIRMED, targetDate);
        
        int sent = 0;
        for (Booking booking : eligibleBookings) {
            // NotificationService idempotencyKey prevents duplicates automatically
            boolean created = notificationService.createNotification(booking, NotificationType.CHECK_IN_REMINDER);
            if (created) {
                sent++;
            }
        }
        
        log.info("Finished processing check-in reminders. Sent: {}", sent);
    }
}

