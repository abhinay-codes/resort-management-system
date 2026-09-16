package com.paradiseresort.backend.security;

import com.paradiseresort.backend.entity.AppUser;
import com.paradiseresort.backend.repository.AppUserRepository;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class CustomUserDetailsService
        implements UserDetailsService {

    private final AppUserRepository userRepository;

    public CustomUserDetailsService(
            AppUserRepository userRepository
    ) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(
            String email
    ) throws UsernameNotFoundException {

        if (email == null || email.isBlank()) {
            throw new UsernameNotFoundException(
                    "User not found"
            );
        }

        String normalizedEmail =
                email.trim().toLowerCase(Locale.ROOT);

        AppUser user =
                userRepository
                        .findByEmailIgnoreCase(normalizedEmail)
                        .orElseThrow(
                                () ->
                                        new UsernameNotFoundException(
                                                "User not found"
                                        )
                        );

        return User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities(
                        new SimpleGrantedAuthority(
                                "ROLE_" + user.getRole().name()
                        )
                )
                .disabled(!user.isEnabled())
                .build();
    }
}