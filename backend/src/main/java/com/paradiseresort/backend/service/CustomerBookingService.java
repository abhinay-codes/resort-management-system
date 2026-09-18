package com.paradiseresort.backend.service;

import com.paradiseresort.backend.dto.BookingRequest;
import com.paradiseresort.backend.dto.BookingResponse;
import com.paradiseresort.backend.dto.CustomerBookingResponse;
import com.paradiseresort.backend.entity.AppUser;
import com.paradiseresort.backend.entity.Booking;
import com.paradiseresort.backend.entity.BookingStatus;
import com.paradiseresort.backend.entity.Payment;
import com.paradiseresort.backend.entity.PaymentStatus;
import com.paradiseresort.backend.repository.AppUserRepository;
import com.paradiseresort.backend.repository.BookingRepository;
import com.paradiseresort.backend.repository.PaymentRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import com.paradiseresort.backend.entity.NotificationType;

@Service
public class CustomerBookingService {

    private final BookingService bookingService;
    private final BookingRepository bookingRepository;
    private final AppUserRepository appUserRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentService paymentService;
    private final NotificationService notificationService;

    public CustomerBookingService(
            BookingService bookingService,
            BookingRepository bookingRepository,
            AppUserRepository appUserRepository,
            PaymentRepository paymentRepository,
            PaymentService paymentService,
            NotificationService notificationService
    ) {
        this.bookingService = bookingService;
        this.bookingRepository = bookingRepository;
        this.appUserRepository = appUserRepository;
        this.paymentRepository = paymentRepository;
        this.paymentService = paymentService;
        this.notificationService = notificationService;
    }

    /*
     * ==========================================
     * CREATE CUSTOMER BOOKING
     * ==========================================
     */

    @Transactional
    public CustomerBookingResponse createBooking(
            BookingRequest request,
            String email
    ) {

        AppUser customer =
                getCustomerByEmail(email);

        /*
         * Create the normal booking.
         *
         * BookingService also creates the
         * associated PENDING payment.
         */
        BookingResponse createdBooking =
                bookingService.createBooking(
                        request
                );

        Booking booking =
                bookingRepository
                        .findById(
                                createdBooking.id()
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalStateException(
                                                "Created booking could not be found."
                                        )
                        );

        /*
         * Attach the authenticated customer
         * to the booking.
         */
        booking.setCustomer(
                customer
        );

        Booking savedBooking =
                bookingRepository.save(
                        booking
                );

        notificationService.createNotification(
                savedBooking,
                NotificationType.BOOKING_CREATED
        );

        return CustomerBookingResponse.fromEntity(
                savedBooking
        );
    }

    /*
     * ==========================================
     * GET MY BOOKINGS
     * ==========================================
     */

    @Transactional(readOnly = true)
    public List<CustomerBookingResponse> getMyBookings(
            String email
    ) {

        AppUser customer =
                getCustomerByEmail(email);

        return bookingRepository
                .findAllByCustomerIdOrderByCheckInDesc(
                        customer.getId()
                )
                .stream()
                .map(
                        CustomerBookingResponse::fromEntity
                )
                .toList();
    }

    /*
     * ==========================================
     * GET MY BOOKING
     * ==========================================
     */

    @Transactional(readOnly = true)
    public CustomerBookingResponse getMyBooking(
            Long bookingId,
            String email
    ) {

        AppUser customer =
                getCustomerByEmail(email);

        Booking booking =
                bookingRepository
                        .findByIdAndCustomerId(
                                bookingId,
                                customer.getId()
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Booking not found."
                                        )
                        );

        return CustomerBookingResponse.fromEntity(
                booking
        );
    }

    /*
     * ==========================================
     * GUEST BOOKING LOOKUP
     * ==========================================
     *
     * Used by the public booking lookup flow.
     *
     * Ownership is established by matching the
     * supplied email against the booking email.
     */

    @Transactional(readOnly = true)
    public CustomerBookingResponse getBookingByGuestEmail(
            Long bookingId,
            String email
    ) {

        if (bookingId == null || bookingId <= 0) {
            throw new IllegalArgumentException(
                    "Booking ID must be a positive number."
            );
        }

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "Email is required."
            );
        }

        Booking booking =
                bookingRepository
                        .findByIdAndEmailIgnoreCase(
                                bookingId,
                                email.trim()
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Booking not found."
                                        )
                        );

        return CustomerBookingResponse.fromEntity(
                booking
        );
    }

    /*
     * ==========================================
     * CANCEL MY BOOKING
     * ==========================================
     *
     * Allowed:
     *
     * PENDING   -> CANCELLED
     * CONFIRMED -> CANCELLED
     *
     * Payment handling:
     *
     * PENDING payment
     *      -> remains PENDING
     *      -> booking cancellation prevents
     *         the payment from being processed
     *
     * FAILED payment
     *      -> remains FAILED
     *      -> booking cancellation prevents retry
     *
     * SUCCESS payment
     *      -> REFUNDED
     *      -> booking CANCELLED
     *
     * Not allowed:
     *
     * CHECKED_IN
     * CHECKED_OUT
     * CANCELLED
     */

    @Transactional
    public CustomerBookingResponse cancelMyBooking(
            Long bookingId,
            String email
    ) {

        AppUser customer =
                getCustomerByEmail(email);

        Booking booking =
                bookingRepository
                        .findByIdAndCustomerIdForUpdate(
                                bookingId,
                                customer.getId()
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Booking not found."
                                        )
                        );

        BookingStatus currentStatus =
                booking.getStatus();

        /*
         * A customer can only cancel a booking
         * before check-in.
         */
        if (currentStatus != BookingStatus.PENDING
                && currentStatus != BookingStatus.CONFIRMED) {

            throw new IllegalStateException(
                    "Only pending or confirmed bookings can be cancelled."
            );
        }

        /*
         * Find the payment associated with
         * this booking.
         */
        Payment payment =
                paymentRepository
                        .findByBookingId(
                                bookingId
                        )
                        .orElse(null);

        /*
         * If the customer has already paid,
         * use the centralized refund flow.
         */
        if (payment != null
                && payment.getStatus()
                        == PaymentStatus.SUCCESS) {

            paymentService.refundPayment(
                    payment.getId()
            );

            Booking refundedBooking =
                    bookingRepository
                            .findByIdAndCustomerId(
                                    bookingId,
                                    customer.getId()
                            )
                            .orElseThrow(
                                    () ->
                                            new IllegalStateException(
                                                    "Cancelled booking could not be reloaded."
                                            )
                            );

            return CustomerBookingResponse.fromEntity(
                    refundedBooking
            );
        }

        /*
         * Pending or failed payments have not
         * transferred money.
         *
         * Cancelling the booking itself prevents:
         *
         * - pending payment from being completed
         * - failed payment from being retried
         * - payment webhook from confirming
         *   the cancelled booking
         */
        booking.setStatus(
                BookingStatus.CANCELLED
        );

        Booking savedBooking =
                bookingRepository.save(
                        booking
                );

        notificationService.createNotification(
                savedBooking,
                NotificationType.BOOKING_CANCELLED,
                false
        );

        return CustomerBookingResponse.fromEntity(
                savedBooking
        );
    }

    /*
     * ==========================================
     * GET CUSTOMER BY EMAIL
     * ==========================================
     */

    private AppUser getCustomerByEmail(
            String email
    ) {

        if (email == null
                || email.isBlank()) {

            throw new IllegalArgumentException(
                    "Email is required."
            );
        }

        AppUser user =
                appUserRepository
                        .findByEmailIgnoreCase(
                                email.trim()
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Customer account not found."
                                        )
                        );

        if (user.getRole() == null
                || !user.getRole().name()
                        .equals("CUSTOMER")) {

            throw new IllegalArgumentException(
                    "Only customers can access customer bookings."
            );
        }

        if (!user.isEnabled()) {

            throw new IllegalStateException(
                    "Customer account is disabled."
            );
        }

        return user;
    }
}