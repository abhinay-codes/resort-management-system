package com.paradiseresort.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Provider-neutral payment webhook payload.
 *
 * A real gateway such as Razorpay/Stripe can later be mapped
 * into this internal request structure.
 */
public record PaymentWebhookRequest(

        @NotBlank(message = "Gateway order ID is required.")
        String gatewayOrderId,

        @NotBlank(message = "Gateway payment ID is required.")
        String gatewayPaymentId,

        @NotBlank(message = "Payment signature is required.")
        String signature,

        @NotNull(message = "Payment success result is required.")
        Boolean success

) {
}