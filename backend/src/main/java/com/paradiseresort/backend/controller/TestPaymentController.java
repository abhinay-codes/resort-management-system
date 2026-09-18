package com.paradiseresort.backend.controller;

import com.paradiseresort.backend.dto.PaymentResponse;
import com.paradiseresort.backend.dto.TestPaymentRequest;
import com.paradiseresort.backend.service.PaymentService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
public class TestPaymentController {

    private final PaymentService paymentService;

    public TestPaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

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

        return ResponseEntity.ok(response);
    }
}
