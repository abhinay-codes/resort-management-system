package com.paradiseresort.backend.dto;

import com.paradiseresort.backend.entity.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentResponse(

        Long id,

        Long bookingId,

        String guestName,

        String email,

        BigDecimal amount,

        PaymentStatus status,

        String paymentReference,

        String paymentMethod,

        String gatewayOrderId,

        String gatewayPaymentId,

        LocalDateTime createdAt,

        LocalDateTime updatedAt

) {
}