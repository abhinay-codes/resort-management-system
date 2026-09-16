package com.paradiseresort.backend.config;

import com.paradiseresort.backend.entity.AppUser;
import com.paradiseresort.backend.repository.AppUserRepository;
import com.paradiseresort.backend.security.Role;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminInitializer {

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Value("${app.admin.name:Resort Admin}")
    private String adminName;

    @Value("${app.admin.reset-password:false}")
    private boolean resetAdminPassword;

    @Bean
    CommandLineRunner initializeAdmin(
            AppUserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {

            AppUser admin = userRepository
                    .findByEmailIgnoreCase(adminEmail)
                    .orElse(null);

            if (admin == null) {

                admin = new AppUser();

                admin.setName(adminName);
                admin.setEmail(adminEmail);
                admin.setPassword(
                        passwordEncoder.encode(adminPassword)
                );
                admin.setRole(Role.ADMIN);
                admin.setEnabled(true);

                userRepository.save(admin);

                System.out.println(
                        "Admin user created successfully: " + adminEmail
                );

            } else if (resetAdminPassword) {

                admin.setName(adminName);
                admin.setPassword(
                        passwordEncoder.encode(adminPassword)
                );
                admin.setRole(Role.ADMIN);
                admin.setEnabled(true);

                userRepository.save(admin);

                System.out.println(
                        "Admin password reset successfully: " + adminEmail
                );
            }
        };
    }
}