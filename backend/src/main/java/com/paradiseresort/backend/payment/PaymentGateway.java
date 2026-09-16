package com.paradiseresort.backend.payment;

import java.math.BigDecimal;

/**
 * Abstraction over an external payment gateway.
 *
 * The application does not directly depend on Razorpay,
 * Stripe, etc.
 *
 * A real provider can implement this interface later.
 */
public interface PaymentGateway {

    /**
     * Creates a payment order with the gateway.
     *
     * @return gateway-generated order ID
     */
    String createOrder(
            Long bookingId,
            BigDecimal amount,
            String currency
    );

    /**
     * Verifies the authenticity of a payment.
     *
     * @return true when the gateway data is valid
     */
    boolean verifyPayment(
            String gatewayOrderId,
            String gatewayPaymentId,
            String signature
    );

    /**
     * Indicates whether this implementation is test mode.
     */
    boolean isTestMode();
}