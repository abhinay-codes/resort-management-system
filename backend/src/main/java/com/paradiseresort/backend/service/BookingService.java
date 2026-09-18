package com.paradiseresort.backend.service;

import com.paradiseresort.backend.dto.BookingRequest;
import com.paradiseresort.backend.dto.BookingResponse;
import com.paradiseresort.backend.dto.PaymentResponse;
import com.paradiseresort.backend.entity.Booking;
import com.paradiseresort.backend.entity.BookingStatus;
import com.paradiseresort.backend.entity.PaymentStatus;
import com.paradiseresort.backend.entity.Room;
import com.paradiseresort.backend.entity.RoomStatus;
import com.paradiseresort.backend.repository.BookingRepository;
import com.paradiseresort.backend.repository.RoomRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import com.paradiseresort.backend.entity.NotificationType;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final PaymentService paymentService;
    private final NotificationService notificationService;

    public BookingService(
            BookingRepository bookingRepository,
            RoomRepository roomRepository,
            PaymentService paymentService,
            NotificationService notificationService
    ) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.paymentService = paymentService;
        this.notificationService = notificationService;
    }

    /*
     * ==========================================
     * CREATE BOOKING
     * ==========================================
     */

    @Transactional
    public BookingResponse createBooking(
            BookingRequest request
    ) {

        /*
         * Check-out must be after check-in.
         */
        if (!request.checkOut().isAfter(
                request.checkIn()
        )) {
            throw new IllegalArgumentException(
                    "Check-out must be after check-in."
            );
        }

        /*
         * Lock the room while creating the booking.
         */
        Room room =
                roomRepository
                        .findByIdForUpdate(
                                request.roomId()
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Room not found."
                                        )
                        );

        /*
         * RoomStatus represents the room's current physical
         * condition, not a date-range reservation lock.
         *
         * A room that is occupied or being cleaned today can
         * still be reserved for a future stay if no booking
         * overlaps the requested dates.
         *
         * Maintenance remains blocked because this system does
         * not yet store maintenance schedules/end dates.
         */
        if (room.getStatus() == RoomStatus.MAINTENANCE) {
            throw new IllegalStateException(
                    "This room is currently under maintenance."
            );
        }

        /*
         * Check room capacity.
         */
        if (request.guests() > room.getGuests()) {
            throw new IllegalArgumentException(
                    "This room allows up to "
                            + room.getGuests()
                            + " guests."
            );
        }

        /*
         * Additional business-rule validation.
         */
        if (request.guests() <= 0) {
            throw new IllegalArgumentException(
                    "Guests must be at least 1."
            );
        }

        /*
         * These statuses occupy a room.
         */
        List<BookingStatus> activeStatuses =
                List.of(
                        BookingStatus.PENDING,
                        BookingStatus.CONFIRMED,
                        BookingStatus.CHECKED_IN
                );

        /*
         * Check overlapping bookings.
         */
        long overlappingBookings =
                bookingRepository.countOverlappingBookings(
                        request.roomId(),
                        request.checkIn(),
                        request.checkOut(),
                        activeStatuses
                );

        if (overlappingBookings > 0) {
            throw new IllegalStateException(
                    "This room is not available for the selected dates."
            );
        }

        /*
         * Calculate number of nights.
         */
        long nights =
                ChronoUnit.DAYS.between(
                        request.checkIn(),
                        request.checkOut()
                );

        /*
         * Calculate total amount using BigDecimal.
         */
        BigDecimal totalAmount =
                room.getPrice()
                        .multiply(
                                BigDecimal.valueOf(nights)
                        );

        /*
         * Create booking entity.
         */
        Booking booking =
                new Booking();

        booking.setGuestName(
                request.guestName()
        );

        booking.setEmail(
                request.email()
        );

        booking.setPhone(
                request.phone()
        );

        booking.setSpecialRequest(
                request.specialRequest()
        );

        booking.setCheckIn(
                request.checkIn()
        );

        booking.setCheckOut(
                request.checkOut()
        );

        booking.setGuests(
                request.guests()
        );

        booking.setTotalAmount(
                totalAmount
        );

        /*
         * Every newly created booking starts
         * in PENDING state.
         */
        booking.setStatus(
                BookingStatus.PENDING
        );

        booking.setRoom(
                room
        );

        /*
         * Save booking first.
         */
        Booking savedBooking =
                bookingRepository.save(
                        booking
                );

        /*
         * Automatically create the payment.
         *
         * The payment starts as PENDING.
         */
        paymentService.createPayment(
                savedBooking.getId()
        );

        /*
         * Return booking.
         */
        return BookingResponse.fromEntity(
                savedBooking
        );
    }

    /*
     * ==========================================
     * ROOM AVAILABILITY
     * ==========================================
     */

    @Transactional(readOnly = true)
    public boolean isRoomAvailable(
            Long roomId,
            LocalDate checkIn,
            LocalDate checkOut
    ) {

        if (!checkOut.isAfter(checkIn)) {
            throw new IllegalArgumentException(
                    "Check-out must be after check-in."
            );
        }

        Room room =
                roomRepository.findById(roomId)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Room not found."
                                )
                        );

        if (room.getStatus() == RoomStatus.MAINTENANCE) {
            return false;
        }

        List<BookingStatus> activeStatuses =
                List.of(
                        BookingStatus.PENDING,
                        BookingStatus.CONFIRMED,
                        BookingStatus.CHECKED_IN
                );

        long overlappingBookings =
                bookingRepository.countOverlappingBookings(
                        roomId,
                        checkIn,
                        checkOut,
                        activeStatuses
                );

        return overlappingBookings == 0;
    }

    /*
     * ==========================================
     * GET BOOKING
     * ==========================================
     */

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(
            Long id
    ) {

        Booking booking =
                bookingRepository
                        .findById(id)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Booking not found."
                                        )
                        );

        return BookingResponse.fromEntity(
                booking
        );
    }

    /*
     * ==========================================
     * GET ALL BOOKINGS
     * ==========================================
     */

    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {

        return bookingRepository
                .findAll()
                .stream()
                .map(
                        BookingResponse::fromEntity
                )
                .toList();
    }

    /*
     * ==========================================
     * UPDATE BOOKING STATUS
     * ==========================================
     */

    @Transactional
    public BookingResponse updateBookingStatus(
            Long id,
            BookingStatus newStatus
    ) {

        if (newStatus == null) {
            throw new IllegalArgumentException(
                    "Booking status is required."
            );
        }

        Booking booking =
                bookingRepository
                        .findByIdForUpdate(
                                id
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
         * ==========================================
         * CONFIRMATION REQUIRES SUCCESSFUL PAYMENT
         * ==========================================
         *
         * A PENDING booking cannot be manually
         * changed to CONFIRMED unless its payment
         * is SUCCESS.
         *
         * Normally PaymentService performs this
         * transition automatically after successful
         * payment.
         */
        if (newStatus == BookingStatus.CONFIRMED
                && currentStatus == BookingStatus.PENDING) {

            PaymentResponse payment =
                    paymentService.getPaymentByBookingId(
                            id
                    );

            if (payment.status()
                    != PaymentStatus.SUCCESS) {

                throw new IllegalStateException(
                        "Booking cannot be confirmed until payment is successful."
                );
            }
        }

        /*
         * Check-in and check-out are operational
         * transitions. They must go through their
         * specialized services so the booking and room
         * states remain synchronized.
         */
        if (newStatus == BookingStatus.CHECKED_IN
                || newStatus == BookingStatus.CHECKED_OUT) {
            throw new IllegalStateException(
                    "Use the check-in or check-out operation for this transition."
            );
        }

        /*
         * ==========================================
         * VALIDATE STATE TRANSITION
         * ==========================================
         */
        boolean validTransition =
                switch (currentStatus) {

                    case PENDING ->
                            newStatus == BookingStatus.CONFIRMED
                                    || newStatus == BookingStatus.CANCELLED;

                    case CONFIRMED ->
                            newStatus == BookingStatus.CHECKED_IN
                                    || newStatus == BookingStatus.CANCELLED;

                    case CHECKED_IN ->
                            newStatus == BookingStatus.CHECKED_OUT;

                    case CHECKED_OUT,
                         CANCELLED ->
                            false;
                };

        if (!validTransition) {
            throw new IllegalStateException(
                    "Cannot change booking status from "
                            + currentStatus
                            + " to "
                            + newStatus
                            + "."
            );
        }

        /*
         * ==========================================
         * CANCELLATION + PAYMENT CONSISTENCY
         * ==========================================
         *
         * If a paid booking is cancelled by an
         * admin/employee through this generic
         * status endpoint, the successful payment
         * must also be refunded.
         *
         * This keeps:
         *
         *     Booking CANCELLED
         *     +
         *     Payment REFUNDED
         *
         * synchronized.
         *
         * Pending/failed payments require no refund.
         */
        if (newStatus == BookingStatus.CANCELLED) {

            PaymentResponse payment =
                    getPaymentIfExists(id);

            if (payment != null
                    && payment.status()
                            == PaymentStatus.SUCCESS) {

                /*
                 * Centralized refund logic.
                 *
                 * PaymentService changes:
                 *
                 * SUCCESS -> REFUNDED
                 * Booking  -> CANCELLED
                 */
                paymentService.refundPayment(
                        payment.id()
                );

                /*
                 * Reload the booking because
                 * refundPayment() updates it.
                 */
                Booking cancelledBooking =
                        bookingRepository
                                .findByIdForUpdate(id)
                                .orElseThrow(
                                        () ->
                                                new IllegalStateException(
                                                        "Cancelled booking could not be reloaded."
                                                )
                                );

                return BookingResponse.fromEntity(
                        cancelledBooking
                );
            }
        }

        /*
         * ==========================================
         * UPDATE STATUS
         * ==========================================
         */
        booking.setStatus(
                newStatus
        );

        /*
         * Save entity.
         */
        Booking savedBooking =
                bookingRepository.save(
                        booking
                );

        if (newStatus == BookingStatus.CONFIRMED) {
            notificationService.createNotification(savedBooking, NotificationType.BOOKING_CONFIRMED);
        } else if (newStatus == BookingStatus.CANCELLED) {
            notificationService.createNotification(savedBooking, NotificationType.BOOKING_CANCELLED, false);
        }

        return BookingResponse.fromEntity(
                savedBooking
        );
    }

    /*
     * ==========================================
     * FIND PAYMENT IF IT EXISTS
     * ==========================================
     *
     * PaymentService.getPaymentByBookingId()
     * throws when a payment does not exist.
     *
     * Cancellation should still be possible for
     * legacy bookings that were created before
     * automatic payment creation existed.
     *
     * Therefore this helper returns null when
     * there is no payment.
     */

    private PaymentResponse getPaymentIfExists(
            Long bookingId
    ) {

        try {
            return paymentService.getPaymentByBookingId(
                    bookingId
            );
        } catch (IllegalArgumentException exception) {

            if ("Payment not found for this booking."
                    .equals(exception.getMessage())) {

                return null;
            }

            throw exception;
        }
    }
}