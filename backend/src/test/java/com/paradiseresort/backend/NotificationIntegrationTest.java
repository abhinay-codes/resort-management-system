package com.paradiseresort.backend;

import com.paradiseresort.backend.dto.*;
import com.paradiseresort.backend.entity.*;
import com.paradiseresort.backend.repository.*;
import com.paradiseresort.backend.service.*;
import com.paradiseresort.backend.security.Role;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test-payment")
class NotificationIntegrationTest {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private CustomerBookingService customerBookingService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private CheckInReminderScheduler checkInReminderScheduler;

    @Autowired
    private HousekeepingTaskRepository housekeepingTaskRepository;

    @Autowired
    private MaintenanceTaskRepository maintenanceTaskRepository;

    private AppUser customer1;
    private AppUser customer2;
    private Room room;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        paymentRepository.deleteAll();
        bookingRepository.deleteAll();
        housekeepingTaskRepository.deleteAll();
        maintenanceTaskRepository.deleteAll();
        roomRepository.deleteAll();
        appUserRepository.deleteAll();

        customer1 = new AppUser();
        customer1.setName("Alice");
        customer1.setEmail("alice.notify@example.com");
        customer1.setPassword("password");
        customer1.setRole(Role.CUSTOMER);
        customer1.setEnabled(true);
        appUserRepository.save(customer1);

        customer2 = new AppUser();
        customer2.setName("Bob");
        customer2.setEmail("bob.notify@example.com");
        customer2.setPassword("password");
        customer2.setRole(Role.CUSTOMER);
        customer2.setEnabled(true);
        appUserRepository.save(customer2);

        room = new Room();
        room.setName("Ocean View");
        room.setDescription("Nice room");
        room.setPrice(new BigDecimal("5000.00"));
        room.setGuests(2);
        room.setStatus(RoomStatus.AVAILABLE);
        roomRepository.save(room);
    }

    @AfterEach
    void tearDown() {
        notificationRepository.deleteAll();
        paymentRepository.deleteAll();
        bookingRepository.deleteAll();
        housekeepingTaskRepository.deleteAll();
        maintenanceTaskRepository.deleteAll();
        roomRepository.deleteAll();
        appUserRepository.deleteAll();
    }

    private BookingRequest createBookingRequest(LocalDate checkIn, LocalDate checkOut) {
        return new BookingRequest(
                "Alice",
                "alice@example.com",
                "1234567890",
                "None",
                checkIn,
                checkOut,
                2,
                room.getId()
        );
    }

    @Test
    void testBookingCreationNotification() {
        // Scenario 3: Booking creation notification
        BookingRequest request = createBookingRequest(LocalDate.now().plusDays(5), LocalDate.now().plusDays(7));
        CustomerBookingResponse response = customerBookingService.createBooking(request, customer1.getEmail());

        List<NotificationResponse> notifications = notificationService.getMyNotifications(customer1.getEmail(), false);
        assertThat(notifications).hasSize(1);
        assertThat(notifications.get(0).type()).isEqualTo(NotificationType.BOOKING_CREATED);
        assertThat(notifications.get(0).bookingId()).isEqualTo(response.id());
    }

    @Test
    void testOwnNotificationsCanBeRetrievedAndOthersCannot() {
        // Scenarios 1 & 2
        BookingRequest request = createBookingRequest(LocalDate.now().plusDays(5), LocalDate.now().plusDays(7));
        customerBookingService.createBooking(request, customer1.getEmail());

        List<NotificationResponse> aliceNotifications = notificationService.getMyNotifications(customer1.getEmail(), false);
        assertThat(aliceNotifications).hasSize(1);

        List<NotificationResponse> bobNotifications = notificationService.getMyNotifications(customer2.getEmail(), false);
        assertThat(bobNotifications).isEmpty();
    }

    @Test
    void testBookingConfirmationNotificationAndIdempotency() {
        // Scenarios 4 & 6
        BookingRequest request = createBookingRequest(LocalDate.now().plusDays(5), LocalDate.now().plusDays(7));
        CustomerBookingResponse booking = customerBookingService.createBooking(request, customer1.getEmail());

        PaymentResponse payment = paymentService.getCustomerPaymentByBooking(booking.id(), customer1.getEmail());

        // Process payment success -> triggers confirmation
        paymentService.processCustomerTestPayment(payment.id(), new TestPaymentRequest(true), customer1.getEmail());

        List<NotificationResponse> notifications = notificationService.getMyNotifications(customer1.getEmail(), false);
        assertThat(notifications).hasSize(2);
        assertThat(notifications.stream().anyMatch(n -> n.type() == NotificationType.BOOKING_CONFIRMED)).isTrue();

        // Idempotency: Manually call notification creation again (should not duplicate)
        Booking entity = bookingRepository.findById(booking.id()).get();
        boolean createdAgain = notificationService.createNotification(entity, NotificationType.BOOKING_CONFIRMED);
        assertThat(createdAgain).isFalse();
        
        List<NotificationResponse> updatedNotifications = notificationService.getMyNotifications(customer1.getEmail(), false);
        assertThat(updatedNotifications).hasSize(2); // Still 2, no duplicates
    }

    @Test
    void testBookingCancellationNotificationAndIdempotency() {
        // Scenarios 5 & 7 (Cancellation before payment)
        BookingRequest request = createBookingRequest(LocalDate.now().plusDays(5), LocalDate.now().plusDays(7));
        CustomerBookingResponse booking = customerBookingService.createBooking(request, customer1.getEmail());

        customerBookingService.cancelMyBooking(booking.id(), customer1.getEmail());

        List<NotificationResponse> notifications = notificationService.getMyNotifications(customer1.getEmail(), false);
        assertThat(notifications).hasSize(2); // Created + Cancelled
        assertThat(notifications.stream().anyMatch(n -> n.type() == NotificationType.BOOKING_CANCELLED)).isTrue();

        // Refund status should be false in message
        NotificationResponse cancelNote = notifications.stream().filter(n -> n.type() == NotificationType.BOOKING_CANCELLED).findFirst().get();
        assertThat(cancelNote.message()).doesNotContain("refund");
    }
    
    @Test
    void testPaidBookingCancellationRefundMessage() {
        // Paid booking cancellation
        BookingRequest request = createBookingRequest(LocalDate.now().plusDays(5), LocalDate.now().plusDays(7));
        CustomerBookingResponse booking = customerBookingService.createBooking(request, customer1.getEmail());

        PaymentResponse payment = paymentService.getCustomerPaymentByBooking(booking.id(), customer1.getEmail());
        paymentService.processCustomerTestPayment(payment.id(), new TestPaymentRequest(true), customer1.getEmail());

        customerBookingService.cancelMyBooking(booking.id(), customer1.getEmail());

        List<NotificationResponse> notifications = notificationService.getMyNotifications(customer1.getEmail(), false);
        // Created + Confirmed + Cancelled
        assertThat(notifications).hasSize(3);
        NotificationResponse cancelNote = notifications.stream().filter(n -> n.type() == NotificationType.BOOKING_CANCELLED).findFirst().get();
        assertThat(cancelNote.message()).contains("refund");
    }

    @Test
    void testUpcomingCheckInReminderAndIdempotency() {
        // Scenarios 8 & 10
        LocalDate checkIn = LocalDate.now().plusDays(1); // Assuming days-before is 1
        BookingRequest request = createBookingRequest(checkIn, checkIn.plusDays(2));
        CustomerBookingResponse booking = customerBookingService.createBooking(request, customer1.getEmail());

        // Must be CONFIRMED for reminder
        PaymentResponse payment = paymentService.getCustomerPaymentByBooking(booking.id(), customer1.getEmail());
        paymentService.processCustomerTestPayment(payment.id(), new TestPaymentRequest(true), customer1.getEmail());

        // Run scheduler
        checkInReminderScheduler.processCheckInReminders();

        List<NotificationResponse> notifications = notificationService.getMyNotifications(customer1.getEmail(), false);
        // Created + Confirmed + Reminder
        assertThat(notifications).hasSize(3);
        assertThat(notifications.stream().anyMatch(n -> n.type() == NotificationType.CHECK_IN_REMINDER)).isTrue();

        // Run scheduler again (idempotency check)
        checkInReminderScheduler.processCheckInReminders();
        List<NotificationResponse> updatedNotifications = notificationService.getMyNotifications(customer1.getEmail(), false);
        assertThat(updatedNotifications).hasSize(3);
    }

    @Test
    void testCancelledBookingsExcludedFromReminders() {
        // Scenario 9
        LocalDate checkIn = LocalDate.now().plusDays(1);
        BookingRequest request = createBookingRequest(checkIn, checkIn.plusDays(2));
        CustomerBookingResponse booking = customerBookingService.createBooking(request, customer1.getEmail());

        customerBookingService.cancelMyBooking(booking.id(), customer1.getEmail());

        // Run scheduler
        checkInReminderScheduler.processCheckInReminders();

        List<NotificationResponse> notifications = notificationService.getMyNotifications(customer1.getEmail(), false);
        assertThat(notifications.stream().noneMatch(n -> n.type() == NotificationType.CHECK_IN_REMINDER)).isTrue();
    }

    @Test
    void testMarkAsReadOwnershipAndReadAll() {
        // Scenarios 11 & 12
        BookingRequest request = createBookingRequest(LocalDate.now().plusDays(5), LocalDate.now().plusDays(7));
        customerBookingService.createBooking(request, customer1.getEmail());

        List<NotificationResponse> unread = notificationService.getMyNotifications(customer1.getEmail(), true);
        assertThat(unread).hasSize(1);
        
        Long notificationId = unread.get(0).id();

        // Bob tries to read Alice's notification
        assertThatThrownBy(() -> notificationService.markAsRead(notificationId, customer2.getEmail()))
                .isInstanceOf(IllegalArgumentException.class);

        // Alice reads it
        notificationService.markAsRead(notificationId, customer1.getEmail());
        assertThat(notificationService.getUnreadCount(customer1.getEmail())).isEqualTo(0);

        // Create another
        customerBookingService.createBooking(createBookingRequest(LocalDate.now().plusDays(8), LocalDate.now().plusDays(10)), customer1.getEmail());
        assertThat(notificationService.getUnreadCount(customer1.getEmail())).isEqualTo(1);

        // Mark all as read
        notificationService.markAllAsRead(customer1.getEmail());
        assertThat(notificationService.getUnreadCount(customer1.getEmail())).isEqualTo(0);
    }
}
