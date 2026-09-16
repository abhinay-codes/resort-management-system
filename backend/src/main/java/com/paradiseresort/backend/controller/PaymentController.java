package com.paradiseresort.backend.controller;

import com.paradiseresort.backend.dto.PaymentResponse;
import com.paradiseresort.backend.dto.PaymentWebhookRequest;
import com.paradiseresort.backend.dto.TestPaymentRequest;
import com.paradiseresort.backend.service.PaymentService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(
            PaymentService paymentService
    ) {
        this.paymentService = paymentService;
    }

    /*
     * ==========================================
     * CREATE PAYMENT
     * ==========================================
     */

    @PostMapping("/booking/{bookingId}")
    public ResponseEntity<PaymentResponse> createPayment(
            @PathVariable Long bookingId,
            Authentication authentication
    ) {

        PaymentResponse response =
                paymentService.createCustomerPayment(
                        bookingId,
                        authentication.getName()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /*
     * ==========================================
     * GET PAYMENT BY BOOKING
     * ==========================================
     */

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<PaymentResponse> getPaymentByBooking(
            @PathVariable Long bookingId,
            Authentication authentication
    ) {

        PaymentResponse response =
                paymentService.getCustomerPaymentByBooking(
                        bookingId,
                        authentication.getName()
                );

        return ResponseEntity.ok(
                response
        );
    }

    /*
     * ==========================================
     * CUSTOMER TEST PAYMENT
     * ==========================================
     *
     * Development/test gateway only.
     */

    @PostMapping("/{paymentId}/test")
    public ResponseEntity<PaymentResponse> processTestPayment(
            @PathVariable Long paymentId,
            @Valid @RequestBody TestPaymentRequest request,
            Authentication authentication
    ) {

        PaymentResponse response =
                paymentService.processCustomerTestPayment(
                        paymentId,
                        request,
                        authentication.getName()
                );

        return ResponseEntity.ok(
                response
        );
    }

    /*
     * ==========================================
     * RETRY FAILED PAYMENT
     * ==========================================
     */

    @PostMapping("/{paymentId}/retry")
    public ResponseEntity<PaymentResponse> retryPayment(
            @PathVariable Long paymentId,
            Authentication authentication
    ) {

        PaymentResponse response =
                paymentService.retryPayment(
                        paymentId,
                        authentication.getName()
                );

        return ResponseEntity.ok(
                response
        );
    }

    /*
     * ==========================================
     * PAYMENT WEBHOOK
     * ==========================================
     *
     * Called by the payment gateway.
     *
     * No customer authentication is required.
     * PaymentService verifies the gateway signature.
     */

    @PostMapping("/webhook")
    public ResponseEntity<PaymentResponse> processWebhook(
            @Valid @RequestBody PaymentWebhookRequest request
    ) {

        PaymentResponse response =
                paymentService.processWebhook(
                        request.gatewayOrderId(),
                        request.gatewayPaymentId(),
                        request.signature(),
                        request.success()
                );

        return ResponseEntity.ok(
                response
        );
    }

    /*
     * ==========================================
     * CUSTOMER PAYMENT HISTORY
     * ==========================================
     */

    @GetMapping("/history")
    public ResponseEntity<List<PaymentResponse>> getPaymentHistory(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                paymentService.getCustomerPayments(
                        authentication.getName()
                )
        );
    }

    /*
     * ==========================================
     * CUSTOMER PAYMENT BY ID
     * ==========================================
     *
     * Ownership is verified by PaymentService
     * before returning the payment.
     */

    @GetMapping("/{paymentId}")
    public ResponseEntity<PaymentResponse> getPaymentById(
            @PathVariable Long paymentId,
            Authentication authentication
    ) {

        PaymentResponse payment =
                paymentService.getCustomerPaymentById(
                        paymentId,
                        authentication.getName()
                );

        return ResponseEntity.ok(
                payment
        );
    }
}