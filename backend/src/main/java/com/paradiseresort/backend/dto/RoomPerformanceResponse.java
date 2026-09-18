package com.paradiseresort.backend.dto;

import java.math.BigDecimal;

public record RoomPerformanceResponse(
        Long roomId,
        String roomName,
        long bookingCount,
        BigDecimal retainedRevenue,
        long cancellationCount
) {
}

