package com.paradiseresort.backend.repository;

import com.paradiseresort.backend.entity.MaintenanceStatus;
import com.paradiseresort.backend.entity.MaintenanceTask;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MaintenanceTaskRepository extends JpaRepository<MaintenanceTask, Long> {

    List<MaintenanceTask> findAllByOrderByCreatedAtDesc();

    List<MaintenanceTask> findByAssignedEmployee_EmailIgnoreCaseOrderByCreatedAtDesc(String email);

    boolean existsByRoom_IdAndStatusIn(Long roomId, List<MaintenanceStatus> statuses);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT m FROM MaintenanceTask m WHERE m.id = :taskId")
    Optional<MaintenanceTask> findByIdForUpdate(@Param("taskId") Long taskId);
}
