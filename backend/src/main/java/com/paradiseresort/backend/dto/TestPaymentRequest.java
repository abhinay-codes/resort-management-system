package com.paradiseresort.backend.dto;

import jakarta.validation.constraints.NotNull;

public record TestPaymentRequest(

        @NotNull(message = "Payment success result is required.")
        Boolean success

) {
}