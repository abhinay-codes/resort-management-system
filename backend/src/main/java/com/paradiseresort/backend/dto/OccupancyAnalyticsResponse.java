package com.paradiseresort.backend.dto;

public record OccupancyAnalyticsResponse(
        long totalAvailableRoomNights,
        long occupiedRoomNights,
        double occupancyPercentage
) {
}

