package com.paradiseresort.backend.dto;

import java.math.BigDecimal;
import java.util.Map;

public record AnalyticsSummaryResponse(
        BigDecimal totalRevenue,
        long totalBookings,
        long cancelledBookings,
        double cancellationRate,
        Map<String, Long> bookingsByStatus
) {
}

