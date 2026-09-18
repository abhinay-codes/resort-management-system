package com.paradiseresort.backend.repository;

import com.paradiseresort.backend.entity.HousekeepingStatus;
import com.paradiseresort.backend.entity.HousekeepingTask;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HousekeepingTaskRepository
        extends JpaRepository<HousekeepingTask, Long> {

    List<HousekeepingTask> findAllByOrderByCreatedAtDesc();

    List<HousekeepingTask>
    findByAssignedEmployee_EmailIgnoreCaseOrderByCreatedAtDesc(
            String email
    );

    Optional<HousekeepingTask>
    findByIdAndAssignedEmployee_EmailIgnoreCase(
            Long id,
            String email
    );

    boolean existsByRoom_IdAndStatusIn(
            Long roomId,
            List<HousekeepingStatus> statuses
    );

    List<HousekeepingTask> findByRoom_IdAndStatusIn(
            Long roomId,
            List<HousekeepingStatus> statuses
    );
}