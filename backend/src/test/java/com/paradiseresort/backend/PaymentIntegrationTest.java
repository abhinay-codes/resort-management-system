package com.paradiseresort.backend;

import com.paradiseresort.backend.dto.*;
import com.paradiseresort.backend.entity.*;
import com.paradiseresort.backend.repository.*;
import com.paradiseresort.backend.service.PaymentService;
import com.paradiseresort.backend.service.CustomerBookingService;
import com.paradiseresort.backend.security.Role;
import com.paradiseresort.backend.payment.TestPaymentGateway;

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
class PaymentIntegrationTest {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private CustomerBookingService customerBookingService;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private AppUserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    private AppUser customer1;
    private AppUser customer2;
    private Room room1;
    private CustomerBookingResponse bookingRes;

    private void setSecurityContext(String email, String role) {
        User userDetails = new User(email, "password", List.of(() -> "ROLE_" + role));
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @BeforeEach
    void setUp() {
        customer1 = new AppUser();
        customer1.setName("Alice");
        customer1.setEmail("alice.pay@example.com");
        customer1.setPassword("password");
        customer1.setRole(Role.CUSTOMER);
        userRepository.save(customer1);

        customer2 = new AppUser();
        customer2.setName("Bob");
        customer2.setEmail("bob.pay@example.com");
        customer2.setPassword("password");
        customer2.setRole(Role.CUSTOMER);
        userRepository.save(customer2);

        room1 = new Room();
        room1.setName("Payment Suite");
        room1.setPrice(new BigDecimal("5000.00"));
        room1.setGuests(2);
        room1.setStatus(RoomStatus.AVAILABLE);
        roomRepository.save(room1);

        BookingRequest req1 = new BookingRequest(customer1.getName(), customer1.getEmail(), "123", "None", LocalDate.now().plusDays(1), LocalDate.now().plusDays(3), 2, room1.getId());
        bookingRes = customerBookingService.createBooking(req1, customer1.getEmail());
    }

    @Test
    void testPaymentCreation() {
        PaymentResponse payRes = paymentService.createCustomerPayment(bookingRes.id(), customer1.getEmail());
        assertThat(payRes.status()).isEqualTo(PaymentStatus.PENDING);
        assertThat(payRes.gatewayOrderId()).startsWith("TEST-ORDER-");
    }

    @Test
    void testSuccessfulTestPaymentWebhook() {
        PaymentResponse payRes = paymentService.createCustomerPayment(bookingRes.id(), customer1.getEmail());
        String sig = "TEST-SIGNATURE-" + payRes.gatewayOrderId() + "-PAY-123";
        
        PaymentResponse finalPay = paymentService.processWebhook(payRes.gatewayOrderId(), "PAY-123", sig, true);
        assertThat(finalPay.status()).isEqualTo(PaymentStatus.SUCCESS);
        
        Booking b = bookingRepository.findById(bookingRes.id()).get();
        assertThat(b.getStatus()).isEqualTo(BookingStatus.CONFIRMED); // booking confirmation flow
    }

    @Test
    void testFailedTestPaymentWebhook() {
        PaymentResponse payRes = paymentService.createCustomerPayment(bookingRes.id(), customer1.getEmail());
        String sig = "TEST-SIGNATURE-" + payRes.gatewayOrderId() + "-PAY-123";
        
        PaymentResponse finalPay = paymentService.processWebhook(payRes.gatewayOrderId(), "PAY-123", sig, false);
        assertThat(finalPay.status()).isEqualTo(PaymentStatus.FAILED);
        
        Booking b = bookingRepository.findById(bookingRes.id()).get();
        assertThat(b.getStatus()).isEqualTo(BookingStatus.PENDING); // does not incorrectly confirm
    }

    @Test
    void testRetryFailedPayment() {
        PaymentResponse payRes = paymentService.createCustomerPayment(bookingRes.id(), customer1.getEmail());
        String sig = "TEST-SIGNATURE-" + payRes.gatewayOrderId() + "-PAY-123";
        paymentService.processWebhook(payRes.gatewayOrderId(), "PAY-123", sig, false); // FAILED
        
        PaymentResponse retryRes = paymentService.retryPayment(payRes.id(), customer1.getEmail());
        assertThat(retryRes.status()).isEqualTo(PaymentStatus.PENDING);
        assertThat(retryRes.gatewayOrderId()).isNotEqualTo(payRes.gatewayOrderId());
    }

    @Test
    void testRefundSuccessfulPayment() {
        PaymentResponse payRes = paymentService.createCustomerPayment(bookingRes.id(), customer1.getEmail());
        String sig = "TEST-SIGNATURE-" + payRes.gatewayOrderId() + "-PAY-123";
        paymentService.processWebhook(payRes.gatewayOrderId(), "PAY-123", sig, true);
        
        customerBookingService.cancelMyBooking(bookingRes.id(), customer1.getEmail());
        // Refund should happen inside cancelMyBooking implicitly, let's verify
        
        Payment p = paymentRepository.findById(payRes.id()).get();
        assertThat(p.getStatus()).isEqualTo(PaymentStatus.REFUNDED);
    }

    @Test
    void testInvalidRefundAttemptRejected() {
        PaymentResponse payRes = paymentService.createCustomerPayment(bookingRes.id(), customer1.getEmail());
        assertThrows(IllegalStateException.class, () -> paymentService.refundPayment(payRes.id())); // PENDING cannot be refunded
    }

    @Test
    void testCustomerCannotAccessAnotherCustomerPayment() {
        assertThrows(IllegalArgumentException.class, () -> paymentService.createCustomerPayment(bookingRes.id(), customer2.getEmail()));
    }

    @Test
    void testDuplicateWebhookIsIdempotent() {
        PaymentResponse payRes = paymentService.createCustomerPayment(bookingRes.id(), customer1.getEmail());
        String sig = "TEST-SIGNATURE-" + payRes.gatewayOrderId() + "-PAY-123";
        
        paymentService.processWebhook(payRes.gatewayOrderId(), "PAY-123", sig, true);
        PaymentResponse dup = paymentService.processWebhook(payRes.gatewayOrderId(), "PAY-123", sig, true);
        
        assertThat(dup.status()).isEqualTo(PaymentStatus.SUCCESS); // idempotent
    }

    @Test
    void testInvalidWebhookSignatureRejected() {
        PaymentResponse payRes = paymentService.createCustomerPayment(bookingRes.id(), customer1.getEmail());
        String sig = "INVALID";
        assertThrows(IllegalArgumentException.class, () -> paymentService.processWebhook(payRes.gatewayOrderId(), "PAY-123", sig, true));
    }
}
