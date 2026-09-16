package com.paradiseresort.backend.controller;

import com.paradiseresort.backend.dto.CreateEmployeeRequest;
import com.paradiseresort.backend.dto.UserResponse;
import com.paradiseresort.backend.service.UserService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;


import java.util.List;


@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final UserService userService;


    public AdminUserController(
            UserService userService
    ) {
        this.userService =
                userService;
    }


    /*
     * ==========================================
     * GET ALL USERS
     * ==========================================
     */

    @GetMapping
    public List<UserResponse> getUsers() {

        return userService.getAllUsers();
    }


    /*
     * ==========================================
     * CREATE EMPLOYEE
     * ==========================================
     */

    @PostMapping
    public ResponseEntity<UserResponse> createEmployee(
            @Valid @RequestBody CreateEmployeeRequest request
    ) {

        UserResponse employee =
                userService.createEmployee(
                        request
                );


        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(employee);
    }


    /*
     * ==========================================
     * UPDATE ENABLED STATUS
     * ==========================================
     */

    @PutMapping("/{id}/enabled")
    public ResponseEntity<UserResponse> updateEnabledStatus(
            @PathVariable Long id,
            @RequestParam boolean enabled
    ) {

        UserResponse updatedUser =
                userService.updateEnabledStatus(
                        id,
                        enabled
                );


        return ResponseEntity.ok(
                updatedUser
        );
    }
}