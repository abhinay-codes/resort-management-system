package com.paradiseresort.backend.repository;

import com.paradiseresort.backend.entity.Payment;
import com.paradiseresort.backend.entity.PaymentStatus;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository
        extends JpaRepository<Payment, Long> {

    Optional<Payment> findByBookingId(Long bookingId);

    Optional<Payment> findByPaymentReference(
            String paymentReference
    );

    boolean existsByBookingId(Long bookingId);

    List<Payment> findByBookingEmailIgnoreCase(
            String email
    );

    List<Payment> findByBookingCustomer_EmailIgnoreCaseOrderByCreatedAtDesc(
            String email
    );

    List<Payment> findByStatus(
            PaymentStatus status
    );

    Optional<Payment> findByGatewayOrderId(
            String gatewayOrderId
    );

    Optional<Payment> findByGatewayPaymentId(
            String gatewayPaymentId
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT p
            FROM Payment p
            WHERE p.id = :id
            """)
    Optional<Payment> findByIdForUpdate(
            @Param("id") Long id
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT p
            FROM Payment p
            WHERE p.gatewayOrderId = :gatewayOrderId
            """)
    Optional<Payment> findByGatewayOrderIdForUpdate(
            @Param("gatewayOrderId") String gatewayOrderId
    );
}