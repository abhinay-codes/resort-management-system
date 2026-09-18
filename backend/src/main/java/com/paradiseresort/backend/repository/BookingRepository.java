package com.paradiseresort.backend.repository;

import com.paradiseresort.backend.entity.Booking;
import com.paradiseresort.backend.entity.BookingStatus;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BookingRepository
        extends JpaRepository<Booking, Long> {

    @Query("""
        SELECT COUNT(b)
        FROM Booking b
        WHERE b.room.id = :roomId
        AND b.status IN :statuses
        AND b.checkIn < :checkOut
        AND b.checkOut > :checkIn
        """)
    long countOverlappingBookings(
            @Param("roomId") Long roomId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut,
            @Param("statuses") List<BookingStatus> statuses
    );

    /*
     * ==========================================
     * GUEST LOOKUP
     * ==========================================
     */

    Optional<Booking> findByIdAndEmailIgnoreCase(
            Long id,
            String email
    );

    List<Booking> findAllByEmailIgnoreCaseOrderByCheckInDesc(
            String email
    );

    /*
     * ==========================================
     * CUSTOMER ACCOUNT LOOKUP
     * ==========================================
     */

    List<Booking> findAllByCustomerIdOrderByCheckInDesc(
            Long customerId
    );

    Optional<Booking> findByIdAndCustomerId(
            Long bookingId,
            Long customerId
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT b
        FROM Booking b
        WHERE b.id = :bookingId
        AND b.customer.id = :customerId
        """)
    Optional<Booking> findByIdAndCustomerIdForUpdate(
            @Param("bookingId") Long bookingId,
            @Param("customerId") Long customerId
    );

    /*
     * ==========================================
     * LOCK BOOKING
     * ==========================================
     */

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT b
        FROM Booking b
        WHERE b.id = :bookingId
        """)
    Optional<Booking> findByIdForUpdate(
            @Param("bookingId") Long bookingId
    );

    /*
     * ==========================================
     * MAINTENANCE BOOKING CONFLICT
     * ==========================================
     *
     * Checks whether a room has any PENDING or
     * CONFIRMED booking with checkout after the
     * given date.
     *
     * Returns a boolean (existence check) rather
     * than a count because only existence matters.
     */

    @Query("SELECT b FROM Booking b WHERE b.status = :status AND b.checkIn = :checkIn")
    List<Booking> findByStatusAndCheckIn(
            @Param("status") BookingStatus status,
            @Param("checkIn") LocalDate checkIn
    );

    @Query("""
        SELECT CASE WHEN COUNT(b) > 0
                    THEN true
                    ELSE false
               END
        FROM Booking b
        WHERE b.room.id = :roomId
        AND b.status IN :statuses
        AND b.checkOut > :today
        """)
    boolean existsActiveBookingWithCheckoutAfter(
            @Param("roomId") Long roomId,
            @Param("statuses") List<BookingStatus> statuses,
            @Param("today") LocalDate today
    );
}