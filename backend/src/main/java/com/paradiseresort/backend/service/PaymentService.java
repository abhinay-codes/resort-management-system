package com.paradiseresort.backend.service;

import com.paradiseresort.backend.dto.PaymentResponse;
import com.paradiseresort.backend.dto.TestPaymentRequest;
import com.paradiseresort.backend.entity.Booking;
import com.paradiseresort.backend.entity.BookingStatus;
import com.paradiseresort.backend.entity.Payment;
import com.paradiseresort.backend.entity.PaymentStatus;
import com.paradiseresort.backend.payment.PaymentGateway;
import com.paradiseresort.backend.repository.BookingRepository;
import com.paradiseresort.backend.repository.PaymentRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.paradiseresort.backend.entity.NotificationType;

@Service
public class PaymentService {

    private static final String CURRENCY = "INR";

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final PaymentGateway paymentGateway;
    private final NotificationService notificationService;

    public PaymentService(
            PaymentRepository paymentRepository,
            BookingRepository bookingRepository,
            PaymentGateway paymentGateway,
            NotificationService notificationService
    ) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.paymentGateway = paymentGateway;
        this.notificationService = notificationService;
    }

    /*
     * ==========================================
     * CREATE PAYMENT
     * ==========================================
     */

    @Transactional
    public PaymentResponse createPayment(
            Long bookingId
    ) {

        validateId(
                bookingId,
                "Booking ID"
        );

        /*
         * Lock booking to prevent concurrent
         * payment creation.
         */
        Booking booking =
                bookingRepository
                        .findByIdForUpdate(
                                bookingId
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Booking not found."
                                        )
                        );

        /*
         * Cancelled bookings can never receive
         * a payment.
         */
        if (booking.getStatus()
                == BookingStatus.CANCELLED) {

            throw new IllegalStateException(
                    "Cancelled bookings cannot have a payment."
            );
        }

        /*
         * New payments are only created for
         * pending bookings.
         */
        if (booking.getStatus()
                != BookingStatus.PENDING) {

            throw new IllegalStateException(
                    "Payment can only be created for a pending booking."
            );
        }

        /*
         * Idempotency:
         *
         * If payment already exists, return it.
         */
        Payment existingPayment =
                paymentRepository
                        .findByBookingId(
                                bookingId
                        )
                        .orElse(null);

        if (existingPayment != null) {
            return toResponse(
                    existingPayment
            );
        }

        /*
         * Validate booking amount.
         */
        if (booking.getTotalAmount() == null
                || booking.getTotalAmount()
                        .compareTo(BigDecimal.ZERO) <= 0) {

            throw new IllegalStateException(
                    "Booking amount must be greater than zero."
            );
        }

        /*
         * Create payment.
         */
        Payment payment =
                new Payment();

        payment.setBooking(
                booking
        );

        payment.setAmount(
                booking.getTotalAmount()
        );

        payment.setStatus(
                PaymentStatus.PENDING
        );

        payment.setPaymentReference(
                generatePaymentReference()
        );

        /*
         * Use TEST when the configured gateway
         * is the test gateway.
         */
        payment.setPaymentMethod(
                paymentGateway.isTestMode()
                        ? "TEST"
                        : "GATEWAY"
        );

        LocalDateTime now =
                LocalDateTime.now();

        payment.setCreatedAt(
                now
        );

        payment.setUpdatedAt(
                now
        );

        /*
         * Save payment before creating the
         * gateway order so the payment has an ID.
         */
        Payment savedPayment =
                paymentRepository.save(
                        payment
                );

        /*
         * Create gateway order.
         */
        String gatewayOrderId =
                paymentGateway.createOrder(
                        booking.getId(),
                        payment.getAmount(),
                        CURRENCY
                );

        savedPayment.setGatewayOrderId(
                gatewayOrderId
        );

        savedPayment.setUpdatedAt(
                LocalDateTime.now()
        );

        savedPayment =
                paymentRepository.save(
                        savedPayment
                );

        return toResponse(
                savedPayment
        );
    }

    /*
     * ==========================================
     * CUSTOMER CREATE PAYMENT
     * ==========================================
     */

    @Transactional
    public PaymentResponse createCustomerPayment(
            Long bookingId,
            String email
    ) {

        validateId(
                bookingId,
                "Booking ID"
        );

        validateCustomerEmail(
                email
        );

        Booking booking =
                bookingRepository
                        .findById(
                                bookingId
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Booking not found."
                                        )
                        );

        verifyCustomerOwnership(
                booking,
                email
        );

        /*
         * Normally the booking already has a payment
         * because BookingService creates it automatically.
         *
         * This fallback keeps the endpoint safe for
         * older bookings that may not have a payment.
         */
        Payment payment =
                paymentRepository
                        .findByBookingId(
                                bookingId
                        )
                        .orElse(null);

        if (payment == null) {
            return createPayment(
                    bookingId
            );
        }

        return toResponse(
                payment
        );
    }

    /*
     * ==========================================
     * GET PAYMENT BY ID
     * ==========================================
     */

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(
            Long paymentId
    ) {

        validateId(
                paymentId,
                "Payment ID"
        );

        Payment payment =
                paymentRepository
                        .findById(
                                paymentId
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Payment not found."
                                        )
                        );

        return toResponse(
                payment
        );
    }

    /*
     * ==========================================
     * GET PAYMENT BY BOOKING
     * ==========================================
     */

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByBookingId(
            Long bookingId
    ) {

        validateId(
                bookingId,
                "Booking ID"
        );

        Payment payment =
                paymentRepository
                        .findByBookingId(
                                bookingId
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Payment not found for this booking."
                                        )
                        );

        return toResponse(
                payment
        );
    }

    /*
     * ==========================================
     * GET CUSTOMER PAYMENT
     * ==========================================
     */

    @Transactional(readOnly = true)
    public PaymentResponse getCustomerPayment(
            Long bookingId,
            String email
    ) {

        validateCustomerEmail(
                email
        );

        Booking booking =
                bookingRepository
                        .findById(
                                bookingId
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Booking not found."
                                        )
                        );

        verifyCustomerOwnership(
                booking,
                email
        );

        return getPaymentByBookingId(
                bookingId
        );
    }

    /*
     * ==========================================
     * CUSTOMER PAYMENT BY BOOKING
     * ==========================================
     */

    @Transactional(readOnly = true)
    public PaymentResponse getCustomerPaymentByBooking(
            Long bookingId,
            String email
    ) {

        return getCustomerPayment(
                bookingId,
                email
        );
    }
    /*
 * ==========================================
 * CUSTOMER PAYMENT BY ID
 * ==========================================
 */

@Transactional(readOnly = true)
public PaymentResponse getCustomerPaymentById(
        Long paymentId,
        String email
) {

    validateId(
            paymentId,
            "Payment ID"
    );

    validateCustomerEmail(
            email
    );

    Payment payment =
            paymentRepository
                    .findById(
                            paymentId
                    )
                    .orElseThrow(
                            () ->
                                    new IllegalArgumentException(
                                            "Payment not found."
                                    )
                    );

    verifyCustomerOwnership(
            payment.getBooking(),
            email
    );

    return toResponse(
            payment
    );
}

    /*
     * ==========================================
     * PROCESS CUSTOMER TEST PAYMENT
     * ==========================================
     */

    @Transactional
    public PaymentResponse processCustomerTestPayment(
            Long paymentId,
            TestPaymentRequest request,
            String email
    ) {

        validateId(paymentId, "Payment ID");
        validateCustomerEmail(email);

        Payment payment =
                paymentRepository
                        .findById(paymentId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Payment not found."
                                        )
                        );

        Long bookingId = payment.getBooking().getId();

        Booking booking =
                bookingRepository
                        .findByIdForUpdate(bookingId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Booking not found."
                                        )
                        );

        payment =
                paymentRepository
                        .findByIdForUpdate(paymentId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Payment not found."
                                        )
                        );

        verifyCustomerOwnership(
                booking,
                email
        );

        return processTestPaymentLocked(
                payment,
                request,
                booking
        );
    }

    /*
     * ==========================================
     * PROCESS TEST PAYMENT
     * ==========================================
     */

    @Transactional
    public PaymentResponse processTestPayment(
            Long paymentId,
            TestPaymentRequest request
    ) {

        validateId(
                paymentId,
                "Payment ID"
        );

        if (request == null
                || request.success() == null) {

            throw new IllegalArgumentException(
                    "Payment result is required."
            );
        }

        Payment payment =
                paymentRepository
                        .findById(paymentId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Payment not found."
                                        )
                        );

        Long bookingId = payment.getBooking().getId();

        Booking booking =
                bookingRepository
                        .findByIdForUpdate(bookingId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Booking not found."
                                        )
                        );

        payment =
                paymentRepository
                        .findByIdForUpdate(paymentId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Payment not found."
                                        )
                        );

        return processTestPaymentLocked(
                payment,
                request,
                booking
        );
    }

    private PaymentResponse processTestPaymentLocked(
            Payment payment,
            TestPaymentRequest request,
            Booking booking
    ) {

        if (request == null
                || request.success() == null) {

            throw new IllegalArgumentException(
                    "Payment result is required."
            );
        }

        if (payment.getStatus()
                != PaymentStatus.PENDING) {

            throw new IllegalStateException(
                    "Only pending payments can be processed."
            );
        }

        if (booking.getStatus()
                != BookingStatus.PENDING) {

            throw new IllegalStateException(
                    "Only pending bookings can be paid."
            );
        }

        LocalDateTime now =
                LocalDateTime.now();

        if (request.success()) {

            payment.setStatus(
                    PaymentStatus.SUCCESS
            );

            payment.setGatewayPaymentId(
                    generateTestPaymentId()
            );

            payment.setUpdatedAt(now);

            booking.setStatus(
                    BookingStatus.CONFIRMED
            );

            booking.setUpdatedAt(now);

        } else {

            payment.setStatus(
                    PaymentStatus.FAILED
            );

            payment.setUpdatedAt(now);
        }

        paymentRepository.save(payment);
        bookingRepository.save(booking);

        if (request.success()) {
            notificationService.createNotification(booking, NotificationType.BOOKING_CONFIRMED);
        }

        return toResponse(payment);
    }

    /*
     * ==========================================
     * RETRY PAYMENT
     * ==========================================
     */

    @Transactional
    public PaymentResponse retryPayment(
            Long paymentId,
            String email
    ) {

        validateId(
                paymentId,
                "Payment ID"
        );

        validateCustomerEmail(email);

        Payment payment =
                paymentRepository
                        .findById(paymentId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Payment not found."
                                        )
                        );

        Long bookingId = payment.getBooking().getId();

        Booking booking =
                bookingRepository
                        .findByIdForUpdate(bookingId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Booking not found."
                                        )
                        );

        payment =
                paymentRepository
                        .findByIdForUpdate(paymentId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Payment not found."
                                        )
                        );

        verifyCustomerOwnership(
                booking,
                email
        );

        if (payment.getStatus()
                != PaymentStatus.FAILED) {

            throw new IllegalStateException(
                    "Only failed payments can be retried."
            );
        }

        if (booking.getStatus()
                != BookingStatus.PENDING) {

            throw new IllegalStateException(
                    "Only pending bookings can retry payment."
            );
        }

        /*
         * Create a new gateway order for retry.
         */
        String gatewayOrderId =
                paymentGateway.createOrder(
                        booking.getId(),
                        payment.getAmount(),
                        CURRENCY
                );

        payment.setGatewayOrderId(
                gatewayOrderId
        );

        payment.setGatewayPaymentId(
                null
        );

        payment.setStatus(
                PaymentStatus.PENDING
        );

        payment.setUpdatedAt(
                LocalDateTime.now()
        );

        Payment savedPayment =
                paymentRepository.save(
                        payment
                );

        return toResponse(
                savedPayment
        );
    }

    /*
     * ==========================================
     * REFUND PAYMENT
     * ==========================================
     */

    @Transactional
    public PaymentResponse refundPayment(
            Long paymentId
    ) {

        validateId(
                paymentId,
                "Payment ID"
        );

        Payment payment =
                paymentRepository
                        .findById(paymentId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Payment not found."
                                        )
                        );

        Long bookingId = payment.getBooking().getId();

        Booking booking =
                bookingRepository
                        .findByIdForUpdate(bookingId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Booking not found."
                                        )
                        );

        payment =
                paymentRepository
                        .findByIdForUpdate(paymentId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Payment not found."
                                        )
                        );

        if (payment.getStatus()
                != PaymentStatus.SUCCESS) {

            throw new IllegalStateException(
                    "Only successful payments can be refunded."
            );
        }

        /*
         * A checked-out booking is already complete.
         * Its successful payment cannot be refunded
         * through the normal cancellation/refund flow.
         */
        if (booking.getStatus()
                == BookingStatus.CHECKED_IN
                || booking.getStatus()
                        == BookingStatus.CHECKED_OUT) {

            throw new IllegalStateException(
                    "Active or completed stays cannot be refunded."
            );
        }

        /*
         * A pending or confirmed booking is cancelled
         * as part of the refund operation.
         *
         * A legacy/inconsistent cancelled booking with
         * a successful payment is allowed to complete
         * its refund without changing its historical
         * booking state.
         */
        if (booking.getStatus()
                == BookingStatus.PENDING
                || booking.getStatus()
                        == BookingStatus.CONFIRMED) {

            booking.setStatus(
                    BookingStatus.CANCELLED
            );

            booking.setUpdatedAt(
                    LocalDateTime.now()
            );

            bookingRepository.save(
                    booking
            );

            notificationService.createNotification(
                    booking,
                    NotificationType.BOOKING_CANCELLED,
                    true
            );
        }

        payment.setStatus(
                PaymentStatus.REFUNDED
        );

        payment.setUpdatedAt(
                LocalDateTime.now()
        );

        Payment savedPayment =
                paymentRepository.save(
                        payment
                );

        return toResponse(
                savedPayment
        );
    }

    /*
     * ==========================================
     * CUSTOMER PAYMENT HISTORY
     * ==========================================
     */

    @Transactional(readOnly = true)
    public List<PaymentResponse> getCustomerPayments(
            String email
    ) {

        validateCustomerEmail(
                email
        );

        return paymentRepository
                .findByBookingCustomer_EmailIgnoreCaseOrderByCreatedAtDesc(
                        email.trim()
                )
                .stream()
                .map(
                        this::toResponse
                )
                .toList();
    }

    /*
     * ==========================================
     * ALL PAYMENTS
     * ==========================================
     */

    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {

        return paymentRepository
                .findAll()
                .stream()
                .map(
                        this::toResponse
                )
                .toList();
    }

    /*
     * ==========================================
     * SUCCESSFUL REVENUE
     * ==========================================
     */

    @Transactional(readOnly = true)
public BigDecimal getSuccessfulRevenue() {

    BigDecimal totalRevenue = BigDecimal.ZERO;

    for (Payment payment : paymentRepository.findByStatus(PaymentStatus.SUCCESS)) {

        BigDecimal amount = payment.getAmount();

        if (amount != null) {
            totalRevenue = totalRevenue.add(amount);
        }
    }

    return totalRevenue;
}

    /*
     * ==========================================
     * WEBHOOK
     * ==========================================
     */

    @Transactional
    public PaymentResponse processWebhook(
            String gatewayOrderId,
            String gatewayPaymentId,
            String signature,
            boolean success
    ) {

        if (gatewayOrderId == null
                || gatewayOrderId.isBlank()) {

            throw new IllegalArgumentException(
                    "Gateway order ID is required."
            );
        }

        if (gatewayPaymentId == null
                || gatewayPaymentId.isBlank()) {

            throw new IllegalArgumentException(
                    "Gateway payment ID is required."
            );
        }

        if (!paymentGateway.verifyPayment(
                gatewayOrderId,
                gatewayPaymentId,
                signature
        )) {

            throw new IllegalArgumentException(
                    "Payment verification failed."
            );
        }

        Payment payment =
                paymentRepository
                        .findByGatewayOrderId(
                                gatewayOrderId
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Payment not found for gateway order."
                                        )
                        );

        Long bookingId = payment.getBooking().getId();

        Booking booking =
                bookingRepository
                        .findByIdForUpdate(bookingId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Booking not found."
                                        )
                        );

        payment =
                paymentRepository
                        .findByGatewayOrderIdForUpdate(
                                gatewayOrderId
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Payment not found for gateway order."
                                        )
                        );

        /*
         * Webhooks are idempotent.
         */
        if (payment.getStatus()
                == PaymentStatus.SUCCESS
                || payment.getStatus()
                        == PaymentStatus.REFUNDED) {

            return toResponse(
                    payment
            );
        }

        if (payment.getStatus()
                != PaymentStatus.PENDING) {

            throw new IllegalStateException(
                    "Only pending payments can receive a payment result."
            );
        }

        if (booking.getStatus()
                != BookingStatus.PENDING) {

            throw new IllegalStateException(
                    "Only pending bookings can receive payment confirmation."
            );
        }

        LocalDateTime now =
                LocalDateTime.now();

        payment.setGatewayPaymentId(
                gatewayPaymentId
        );

        if (success) {

            payment.setStatus(
                    PaymentStatus.SUCCESS
            );

            booking.setStatus(
                    BookingStatus.CONFIRMED
            );

            booking.setUpdatedAt(
                    now
            );

        } else {

            payment.setStatus(
                    PaymentStatus.FAILED
            );
        }

        payment.setUpdatedAt(
                now
        );

        paymentRepository.save(
                payment
        );

        bookingRepository.save(
                booking
        );

        if (success) {
            notificationService.createNotification(
                    booking,
                    NotificationType.BOOKING_CONFIRMED
            );
        }

        return toResponse(
                payment
        );
    }

    /*
     * ==========================================
     * RESPONSE MAPPING
     * ==========================================
     */

    private PaymentResponse toResponse(
            Payment payment
    ) {

        Booking booking =
                payment.getBooking();

        return new PaymentResponse(
                payment.getId(),
                booking.getId(),
                booking.getGuestName(),
                booking.getEmail(),
                payment.getAmount(),
                payment.getStatus(),
                payment.getPaymentReference(),
                payment.getPaymentMethod(),
                payment.getGatewayOrderId(),
                payment.getGatewayPaymentId(),
                payment.getCreatedAt(),
                payment.getUpdatedAt()
        );
    }

    /*
     * ==========================================
     * OWNERSHIP
     * ==========================================
     */

    private void verifyCustomerOwnership(
            Booking booking,
            String email
    ) {

        String normalizedEmail = email.trim();

        /*
         * For account-created bookings, customer_id is the
         * authoritative ownership relationship.
         *
         * The guest-email fallback preserves access for older
         * bookings that predate customer_id.
         */
        if (booking.getCustomer() != null) {

            if (!booking.getCustomer()
                    .getEmail()
                    .equalsIgnoreCase(normalizedEmail)) {

                throw new IllegalArgumentException(
                        "You are not authorized to access this payment."
                );
            }

            return;
        }

        if (booking.getEmail() == null
                || !booking.getEmail()
                        .equalsIgnoreCase(normalizedEmail)) {

            throw new IllegalArgumentException(
                    "You are not authorized to access this payment."
            );
        }
    }

    private void validateCustomerEmail(
            String email
    ) {

        if (email == null
                || email.isBlank()) {

            throw new IllegalArgumentException(
                    "Email is required."
            );
        }
    }

    /*
     * ==========================================
     * ID VALIDATION
     * ==========================================
     */

    private void validateId(
            Long id,
            String fieldName
    ) {

        if (id == null || id <= 0) {

            throw new IllegalArgumentException(
                    fieldName
                            + " must be a positive number."
            );
        }
    }

    /*
     * ==========================================
     * PAYMENT REFERENCES
     * ==========================================
     */

    private String generatePaymentReference() {

        return "PAY-"
                + UUID.randomUUID()
                        .toString()
                        .replace(
                                "-",
                                ""
                        )
                        .substring(
                                0,
                                16
                        )
                        .toUpperCase();
    }

    private String generateTestPaymentId() {

        return "TEST-PAY-"
                + UUID.randomUUID()
                        .toString()
                        .replace(
                                "-",
                                ""
                        )
                        .substring(
                                0,
                                16
                        )
                        .toUpperCase();
    }
}
