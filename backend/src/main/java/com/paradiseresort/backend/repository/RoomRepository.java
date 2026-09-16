package com.paradiseresort.backend.repository;

import com.paradiseresort.backend.entity.Room;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;


public interface RoomRepository
        extends JpaRepository<Room, Long> {


    /*
     * ==========================================
     * FIND ROOM WITH DATABASE WRITE LOCK
     * ==========================================
     *
     * PESSIMISTIC_WRITE tells the database:
     *
     * "Lock this room row while this transaction
     * is working with it."
     *
     * This prevents two booking transactions from
     * simultaneously performing the availability
     * check for the same room.
     */

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT r
        FROM Room r
        WHERE r.id = :roomId
        """)
    Optional<Room> findByIdForUpdate(
            @Param("roomId") Long roomId
    );
}