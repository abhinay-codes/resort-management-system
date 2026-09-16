package com.paradiseresort.backend.service;

import com.paradiseresort.backend.dto.CreateEmployeeRequest;
import com.paradiseresort.backend.dto.EmployeeResponse;
import com.paradiseresort.backend.dto.RegisterCustomerRequest;
import com.paradiseresort.backend.dto.UserResponse;
import com.paradiseresort.backend.entity.AppUser;
import com.paradiseresort.backend.repository.AppUserRepository;
import com.paradiseresort.backend.security.Role;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class UserService {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            AppUserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /*
     * ==========================================
     * REGISTER CUSTOMER
     * ==========================================
     */

    @Transactional
    public Map<String, Object> registerCustomer(
            RegisterCustomerRequest request
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Customer registration request is required."
            );
        }

        if (
                request.name() == null
                || request.name().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Customer name is required."
            );
        }

        if (
                request.email() == null
                || request.email().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Customer email is required."
            );
        }

        if (
                request.password() == null
                || request.password().length() < 8
                || request.password().length() > 72
        ) {
            throw new IllegalArgumentException(
                    "Customer password must contain between 8 and 72 characters."
            );
        }

        String normalizedEmail =
                request.email()
                        .trim()
                        .toLowerCase(Locale.ROOT);

        /*
         * Email must be unique across ALL users.
         *
         * This prevents a customer from registering
         * with an email already belonging to an admin
         * or employee.
         */
        if (
                userRepository
                        .findByEmail(normalizedEmail)
                        .isPresent()
        ) {
            throw new IllegalStateException(
                    "A user with this email already exists."
            );
        }

        /*
         * Create the customer account.
         */
        AppUser customer =
                new AppUser();

        customer.setName(
                request.name().trim()
        );

        customer.setEmail(
                normalizedEmail
        );

        /*
         * NEVER store the raw password.
         *
         * BCrypt converts the password into a
         * one-way password hash.
         */
        customer.setPassword(
                passwordEncoder.encode(
                        request.password()
                )
        );

        /*
         * Public registration can ONLY create
         * CUSTOMER accounts.
         *
         * The user cannot choose ADMIN or EMPLOYEE.
         */
        customer.setRole(
                Role.CUSTOMER
        );

        customer.setEnabled(
                true
        );

        AppUser savedCustomer =
                userRepository.save(
                        customer
                );

        /*
         * Do not return the password or password hash.
         */
        return Map.of(
                "id", savedCustomer.getId(),
                "name", savedCustomer.getName(),
                "email", savedCustomer.getEmail(),
                "role", savedCustomer.getRole().name()
        );
    }

    /*
     * ==========================================
     * GET ALL USERS
     * ==========================================
     */

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {

        return userRepository
                .findAll()
                .stream()
                .map(UserResponse::from)
                .toList();
    }

    /*
     * ==========================================
     * GET ALL EMPLOYEES
     * ==========================================
     */

    @Transactional(readOnly = true)
    public List<EmployeeResponse> getEmployees() {

        return userRepository
                .findAll()
                .stream()
                .filter(user ->
                        user.getRole() == Role.EMPLOYEE
                )
                .map(EmployeeResponse::fromEntity)
                .toList();
    }

    /*
     * ==========================================
     * CREATE EMPLOYEE
     * ==========================================
     */

    @Transactional
    public UserResponse createEmployee(
            CreateEmployeeRequest request
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Employee request is required."
            );
        }

        if (
                request.name() == null
                || request.name().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Employee name is required."
            );
        }

        if (
                request.email() == null
                || request.email().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Employee email is required."
            );
        }

        if (
                request.password() == null
                || request.password().length() < 8
        ) {
            throw new IllegalArgumentException(
                    "Employee password must contain at least 8 characters."
            );
        }

        String normalizedEmail =
                request.email()
                        .trim()
                        .toLowerCase();

        if (
                userRepository
                        .findByEmail(normalizedEmail)
                        .isPresent()
        ) {
            throw new IllegalStateException(
                    "A user with this email already exists."
            );
        }

        AppUser employee =
                new AppUser();

        employee.setName(
                request.name().trim()
        );

        employee.setEmail(
                normalizedEmail
        );

        employee.setPassword(
                passwordEncoder.encode(
                        request.password()
                )
        );

        employee.setRole(
                Role.EMPLOYEE
        );

        employee.setEnabled(
                true
        );

        AppUser savedEmployee =
                userRepository.save(
                        employee
                );

        return UserResponse.from(
                savedEmployee
        );
    }

    /*
     * ==========================================
     * UPDATE ENABLED STATUS
     * ==========================================
     */

    @Transactional
    public UserResponse updateEnabledStatus(
            Long userId,
            boolean enabled
    ) {

        if (
                userId == null
                || userId <= 0
        ) {
            throw new IllegalArgumentException(
                    "User ID must be a positive number."
            );
        }

        AppUser user =
                userRepository.findById(userId)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "User not found."
                                )
                        );

        /*
         * Admin accounts cannot be disabled
         * through employee management.
         */
        if (user.getRole() == Role.ADMIN) {
            throw new IllegalStateException(
                    "Admin accounts cannot be disabled through this operation."
            );
        }

        user.setEnabled(
                enabled
        );

        AppUser savedUser =
                userRepository.save(
                        user
                );

        return UserResponse.from(
                savedUser
        );
    }

    /*
     * ==========================================
     * BACKWARD-COMPATIBLE METHOD
     * ==========================================
     */

    @Transactional
    public UserResponse updateUserEnabled(
            Long userId,
            boolean enabled
    ) {

        return updateEnabledStatus(
                userId,
                enabled
        );
    }
}