package com.paradiseresort.backend.dto;

import java.math.BigDecimal;

public record MonthlyAnalyticsResponse(
        String month, // Format: YYYY-MM
        BigDecimal revenue,
        long bookings,
        long cancellations,
        double occupancyPercentage
) {
}

