package com.paradiseresort.backend.controller;

import com.paradiseresort.backend.dto.EmployeeResponse;
import com.paradiseresort.backend.service.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/staff")
public class AdminStaffController {

    private final UserService userService;

    public AdminStaffController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/employees")
    public ResponseEntity<List<EmployeeResponse>> getEmployees() {

        return ResponseEntity.ok(
                userService.getEmployees()
        );
    }
}