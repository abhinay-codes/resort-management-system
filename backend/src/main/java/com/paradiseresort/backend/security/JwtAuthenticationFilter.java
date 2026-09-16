package com.paradiseresort.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

import org.springframework.stereotype.Component;

import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter
        extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            CustomUserDetailsService userDetailsService
    ) {
        this.jwtService =
                jwtService;

        this.userDetailsService =
                userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader =
                request.getHeader("Authorization");

        /*
         * No Authorization header or a non-Bearer
         * authentication scheme means there is no JWT
         * to process.
         *
         * The request continues normally.
         */
        if (
                authHeader == null
                || !authHeader.startsWith("Bearer ")
        ) {
            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }

        String token =
                authHeader.substring(7).trim();

        /*
         * An empty Bearer token is invalid.
         * We simply leave the request unauthenticated.
         */
        if (token.isBlank()) {
            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }

        try {

            String email =
                    jwtService.extractUsername(token);

            if (
                    email != null
                    && SecurityContextHolder
                            .getContext()
                            .getAuthentication() == null
            ) {

                UserDetails userDetails =
                        userDetailsService
                                .loadUserByUsername(email);

                if (
                        userDetails.isEnabled()
                        && jwtService.isTokenValid(
                                token,
                                userDetails
                        )
                ) {

                    UsernamePasswordAuthenticationToken
                            authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authentication.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(
                                    authentication
                            );
                }
            }

        } catch (Exception ignored) {

            /*
             * Invalid, expired, malformed, or otherwise
             * unusable JWT:
             *
             * Do not authenticate the request.
             *
             * Spring Security will decide whether the
             * endpoint requires authentication and return
             * 401 if necessary.
             */
        }

        filterChain.doFilter(
                request,
                response
        );
    }
}