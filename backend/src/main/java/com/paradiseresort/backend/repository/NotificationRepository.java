package com.paradiseresort.backend.repository;

import com.paradiseresort.backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByCustomer_IdOrderByCreatedAtDesc(Long customerId);

    List<Notification> findByCustomer_IdAndReadFalseOrderByCreatedAtDesc(Long customerId);

    long countByCustomer_IdAndReadFalse(Long customerId);

    Optional<Notification> findByIdAndCustomer_Id(Long id, Long customerId);

    boolean existsByIdempotencyKey(String idempotencyKey);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.customer.id = :customerId AND n.read = false")
    void markAllAsReadByCustomerId(@Param("customerId") Long customerId);
}

