package com.paradiseresort.backend;

import com.paradiseresort.backend.dto.*;
import com.paradiseresort.backend.entity.*;
import com.paradiseresort.backend.repository.*;
import com.paradiseresort.backend.service.CustomerBookingService;
import com.paradiseresort.backend.service.RoomStateService;
import com.paradiseresort.backend.security.Role;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@ActiveProfiles("test-payment")
@Transactional
class BookingIntegrationTest {

    @Autowired
    private CustomerBookingService customerBookingService;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private AppUserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    private AppUser customer1;
    private AppUser customer2;
    private Room room1;

    @BeforeEach
    void setUp() {
        customer1 = new AppUser();
        customer1.setName("Alice");
        customer1.setEmail("alice@example.com");
        customer1.setPassword("password");
        customer1.setRole(Role.CUSTOMER);
        userRepository.save(customer1);

        customer2 = new AppUser();
        customer2.setName("Bob");
        customer2.setEmail("bob@example.com");
        customer2.setPassword("password");
        customer2.setRole(Role.CUSTOMER);
        userRepository.save(customer2);

        room1 = new Room();
        room1.setName("Ocean View");
        room1.setPrice(new BigDecimal("5000.00"));
        room1.setGuests(2);
        room1.setStatus(RoomStatus.AVAILABLE);
        roomRepository.save(room1);
    }

    private void setSecurityContext(String email, String role) {
        User userDetails = new User(email, "password", List.of(() -> "ROLE_" + role));
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    void testValidBookingCreation() {
        BookingRequest req = new BookingRequest(customer1.getName(), customer1.getEmail(), "123", "None", LocalDate.now().plusDays(1), LocalDate.now().plusDays(3), 2, room1.getId());
        
        CustomerBookingResponse res = customerBookingService.createBooking(req, customer1.getEmail());
        assertThat(res.status()).isEqualTo(BookingStatus.PENDING.name());
        
        Booking b = bookingRepository.findById(res.id()).get();
        assertThat(b.getCustomer().getEmail()).isEqualTo("alice@example.com");
        assertThat(b.getRoom().getId()).isEqualTo(room1.getId());
    }

    @Test
    void testOverlappingActiveBookingRejected() {
        BookingRequest req1 = new BookingRequest(customer1.getName(), customer1.getEmail(), "123", "None", LocalDate.now().plusDays(1), LocalDate.now().plusDays(5), 2, room1.getId());
        customerBookingService.createBooking(req1, customer1.getEmail());

        BookingRequest req2 = new BookingRequest(customer2.getName(), customer2.getEmail(), "123", "None", LocalDate.now().plusDays(3), LocalDate.now().plusDays(7), 2, room1.getId());
        
        assertThrows(IllegalStateException.class, () -> customerBookingService.createBooking(req2, customer2.getEmail()));
    }

    @Test
    void testBoundaryDateBehavior() {
        // checkout of previous booking equal to new check-in must be allowed
        BookingRequest req1 = new BookingRequest(customer1.getName(), customer1.getEmail(), "123", "None", LocalDate.now().plusDays(1), LocalDate.now().plusDays(3), 2, room1.getId());
        customerBookingService.createBooking(req1, customer1.getEmail());

        BookingRequest req2 = new BookingRequest(customer2.getName(), customer2.getEmail(), "123", "None", LocalDate.now().plusDays(3), LocalDate.now().plusDays(5), 2, room1.getId());
        CustomerBookingResponse res = customerBookingService.createBooking(req2, customer2.getEmail());
        
        assertThat(res.id()).isNotNull();
    }

    @Test
    void testInvalidDateRange() {
        // checkout before checkin
        BookingRequest req1 = new BookingRequest(customer1.getName(), customer1.getEmail(), "123", "None", LocalDate.now().plusDays(5), LocalDate.now().plusDays(1), 2, room1.getId());
        assertThrows(IllegalArgumentException.class, () -> customerBookingService.createBooking(req1, customer1.getEmail()));
    }

    @Test
    void testRoomCapacityViolation() {
        BookingRequest req1 = new BookingRequest(customer1.getName(), customer1.getEmail(), "123", "None", LocalDate.now().plusDays(1), LocalDate.now().plusDays(3), 5, room1.getId()); // 5 guests in 2 capacity room
        assertThrows(IllegalArgumentException.class, () -> customerBookingService.createBooking(req1, customer1.getEmail()));
    }

    @Test
    void testCustomerAccessTheirOwnBooking() {
        BookingRequest req1 = new BookingRequest(customer1.getName(), customer1.getEmail(), "123", "None", LocalDate.now().plusDays(1), LocalDate.now().plusDays(3), 2, room1.getId());
        CustomerBookingResponse res = customerBookingService.createBooking(req1, customer1.getEmail());
        
        CustomerBookingResponse fetched = customerBookingService.getMyBooking(res.id(), customer1.getEmail());
        assertThat(fetched.id()).isEqualTo(res.id());
    }

    @Test
    void testCustomerCannotAccessAnotherCustomerBooking() {
        BookingRequest req1 = new BookingRequest(customer1.getName(), customer1.getEmail(), "123", "None", LocalDate.now().plusDays(1), LocalDate.now().plusDays(3), 2, room1.getId());
        CustomerBookingResponse res = customerBookingService.createBooking(req1, customer1.getEmail());
        
        assertThrows(Exception.class, () -> customerBookingService.getMyBooking(res.id(), customer2.getEmail()));
    }

    @Test
    void testValidCancellationSucceeds() {
        BookingRequest req1 = new BookingRequest(customer1.getName(), customer1.getEmail(), "123", "None", LocalDate.now().plusDays(1), LocalDate.now().plusDays(3), 2, room1.getId());
        CustomerBookingResponse res = customerBookingService.createBooking(req1, customer1.getEmail());
        
        CustomerBookingResponse cancelled = customerBookingService.cancelMyBooking(res.id(), customer1.getEmail());
        assertThat(cancelled.status()).isEqualTo(BookingStatus.CANCELLED.name());
    }

    @Test
    void testInvalidBookingStateTransition() {
        // cannot cancel a CHECKED_IN booking
        BookingRequest req1 = new BookingRequest(customer1.getName(), customer1.getEmail(), "123", "None", LocalDate.now().plusDays(1), LocalDate.now().plusDays(3), 2, room1.getId());
        CustomerBookingResponse res = customerBookingService.createBooking(req1, customer1.getEmail());
        
        Booking b = bookingRepository.findById(res.id()).get();
        b.setStatus(BookingStatus.CHECKED_IN);
        bookingRepository.save(b);
        
        assertThrows(IllegalStateException.class, () -> customerBookingService.cancelMyBooking(b.getId(), customer1.getEmail()));
    }
}
