package com.paradiseresort.backend.payment;

import org.springframework.stereotype.Component;
import org.springframework.context.annotation.Profile;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Development/test implementation of PaymentGateway.
 *
 * This allows us to build and test the complete payment
 * architecture without connecting to a real payment provider.
 */
@Component
@Profile("test-payment")
public class TestPaymentGateway implements PaymentGateway {

    @Override
    public String createOrder(
            Long bookingId,
            BigDecimal amount,
            String currency
    ) {

        return "TEST-ORDER-" +
                UUID.randomUUID()
                        .toString()
                        .replace("-", "")
                        .substring(0, 16)
                        .toUpperCase();
    }

    @Override
    public boolean verifyPayment(
            String gatewayOrderId,
            String gatewayPaymentId,
            String signature
    ) {

        if (gatewayOrderId == null
                || gatewayOrderId.isBlank()) {
            return false;
        }

        if (gatewayPaymentId == null
                || gatewayPaymentId.isBlank()) {
            return false;
        }

        if (signature == null
                || signature.isBlank()) {
            return false;
        }

        /*
         * Test-mode signature format:
         *
         * TEST-SIGNATURE-{orderId}-{paymentId}
         *
         * Example:
         *
         * TEST-SIGNATURE-TEST-ORDER-ABC123-TEST-PAYMENT-XYZ789
         */
        String expectedSignature =
                "TEST-SIGNATURE-"
                        + gatewayOrderId
                        + "-"
                        + gatewayPaymentId;

        return expectedSignature.equals(signature);
    }

    @Override
    public boolean isTestMode() {
        return true;
    }
}
