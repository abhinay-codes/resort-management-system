package com.paradiseresort.backend.dto;

import java.math.BigDecimal;

public record CustomerAnalyticsResponse(
        long totalRegisteredCustomers,
        long newCustomersInRange,
        long customersWithBookingsInRange
) {
}

