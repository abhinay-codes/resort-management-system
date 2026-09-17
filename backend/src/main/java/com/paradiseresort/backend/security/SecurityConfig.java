package com.paradiseresort.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;

import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import org.springframework.http.MediaType;

import java.nio.charset.StandardCharsets;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomUserDetailsService customUserDetailsService;

    @Value("${app.cors.allowed-origin:http://localhost:5173}")
    private String allowedOrigin;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            CustomUserDetailsService customUserDetailsService
    ) {
        this.jwtAuthenticationFilter =
                jwtAuthenticationFilter;

        this.customUserDetailsService =
                customUserDetailsService;
    }

    /*
     * ==========================================
     * SECURITY FILTER CHAIN
     * ==========================================
     */

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                /*
                 * REST API does not use CSRF tokens.
                 */
                .csrf(
                        csrf ->
                                csrf.disable()
                )

                /*
                 * CORS.
                 */
                .cors(
                        cors ->
                                {}
                )

                /*
                 * Disable browser form login.
                 */
                .formLogin(
                        form ->
                                form.disable()
                )

                /*
                 * Disable HTTP Basic.
                 */
                .httpBasic(
                        basic ->
                                basic.disable()
                )

                /*
                 * JWT authentication is stateless.
                 */
                .sessionManagement(
                        session ->
                                session.sessionCreationPolicy(
                                        SessionCreationPolicy.STATELESS
                                )
                )

                /*
                 * Authentication/authorization errors.
                 */
                .exceptionHandling(
                        exceptions ->
                                exceptions
                                        .authenticationEntryPoint(
                                                authenticationEntryPoint()
                                        )
                                        .accessDeniedHandler(
                                                accessDeniedHandler()
                                        )
                )

                /*
                 * ==========================================
                 * AUTHORIZATION
                 * ==========================================
                 */

                .authorizeHttpRequests(
                        auth -> auth

                                /*
                                 * Authentication endpoints.
                                 */
                                .requestMatchers(
                                        "/api/auth/**"
                                )
                                .permitAll()

                                /*
                                 * Public room endpoints.
                                 */
                                .requestMatchers(
                                        "/api/rooms/**"
                                )
                                .permitAll()

                                /*
                                 * Public booking lookup/creation.
                                 */
                                .requestMatchers(
                                        "/api/bookings/**"
                                )
                                .permitAll()

                                /*
                                 * Payment webhook is called by
                                 * the gateway.
                                 */
                                .requestMatchers(
                                        "/api/payments/webhook"
                                )
                                .permitAll()

                                /*
                                 * Admin APIs.
                                 */
                                .requestMatchers(
                                        "/api/admin/**"
                                )
                                .hasRole("ADMIN")

                                /*
                                 * Employee APIs.
                                 */
                                .requestMatchers(
                                        "/api/employee/**"
                                )
                                .hasRole("EMPLOYEE")

                                /*
                                 * Customer APIs.
                                 */
                                .requestMatchers(
                                        "/api/customer/**"
                                )
                                .hasRole("CUSTOMER")

                                /*
                                 * Customer payment APIs require a customer
                                 * account. Ownership is additionally
                                 * validated by PaymentService.
                                 */
                                .requestMatchers(
                                        "/api/payments/**"
                                )
                                .hasRole("CUSTOMER")

                                /*
                                 * Everything else.
                                 */
                                .anyRequest()
                                .authenticated()
                );

        /*
         * JWT filter executes before Spring's
         * username/password filter.
         */
        http.addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
        );

        return http.build();
    }

    /*
     * ==========================================
     * PASSWORD ENCODER
     * ==========================================
     */

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
                java.util.List.of(allowedOrigin)
        );

        configuration.setAllowedMethods(
                java.util.List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                java.util.List.of("*")
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /*
     * ==========================================
     * AUTHENTICATION PROVIDER
     * ==========================================
     */

    @Bean
    public AuthenticationProvider authenticationProvider(
            PasswordEncoder passwordEncoder
    ) {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(
                        customUserDetailsService
                );

        provider.setPasswordEncoder(
                passwordEncoder
        );

        return provider;
    }

    /*
     * ==========================================
     * AUTHENTICATION MANAGER
     * ==========================================
     */

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {

        return configuration
                .getAuthenticationManager();
    }

    /*
     * ==========================================
     * 401 HANDLER
     * ==========================================
     */

    @Bean
    public AuthenticationEntryPoint authenticationEntryPoint() {

        return (
                request,
                response,
                authenticationException
        ) -> {

            response.setStatus(401);

            response.setContentType(
                    MediaType.APPLICATION_JSON_VALUE
            );

            response.setCharacterEncoding(
                    StandardCharsets.UTF_8.name()
            );

            response.getWriter().write(
                    """
                    {
                        "status": 401,
                        "message": "Authentication is required."
                    }
                    """
            );
        };
    }

    /*
     * ==========================================
     * 403 HANDLER
     * ==========================================
     */

    @Bean
    public AccessDeniedHandler accessDeniedHandler() {

        return (
                request,
                response,
                accessDeniedException
        ) -> {

            response.setStatus(403);

            response.setContentType(
                    MediaType.APPLICATION_JSON_VALUE
            );

            response.setCharacterEncoding(
                    StandardCharsets.UTF_8.name()
            );

            response.getWriter().write(
                    """
                    {
                        "status": 403,
                        "message": "You do not have permission to access this resource."
                    }
                    """
            );
        };
    }
}
