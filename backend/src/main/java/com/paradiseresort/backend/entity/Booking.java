package com.paradiseresort.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "booking",
        indexes = {
                @Index(
                        name = "idx_booking_room_dates",
                        columnList = "room_id, check_in, check_out"
                ),
                @Index(
                        name = "idx_booking_status",
                        columnList = "status"
                ),
                @Index(
                        name = "idx_booking_email",
                        columnList = "email"
                ),
                @Index(
                        name = "idx_booking_customer",
                        columnList = "customer_id"
                )
        }
)
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Guest name is required.")
    @Size(
            max = 100,
            message = "Guest name must not exceed 100 characters."
    )
    @Column(
            nullable = false,
            length = 100
    )
    private String guestName;

    @NotBlank(message = "Email is required.")
    @Email(message = "Please provide a valid email address.")
    @Size(
            max = 255,
            message = "Email must not exceed 255 characters."
    )
    @Column(
            nullable = false,
            length = 255
    )
    private String email;

    @NotBlank(message = "Phone number is required.")
    @Size(
            max = 30,
            message = "Phone number must not exceed 30 characters."
    )
    @Column(
            nullable = false,
            length = 30
    )
    private String phone;

    @Size(
            max = 1000,
            message = "Special request must not exceed 1000 characters."
    )
    @Column(length = 1000)
    private String specialRequest;

    @NotNull(message = "Check-in date is required.")
    @Column(nullable = false)
    private LocalDate checkIn;

    @NotNull(message = "Check-out date is required.")
    @Column(nullable = false)
    private LocalDate checkOut;

    @Min(
            value = 1,
            message = "Number of guests must be at least 1."
    )
    @Column(nullable = false)
    private int guests;

    @NotNull(message = "Total amount is required.")
    @DecimalMin(
            value = "0.01",
            message = "Total amount must be greater than 0."
    )
    @Column(
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal totalAmount;

    @NotNull(message = "Booking status is required.")
    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private BookingStatus status;

    /*
     * ==========================================
     * CUSTOMER ACCOUNT
     * ==========================================
     */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "customer_id"
    )
    private AppUser customer;

    /*
     * ==========================================
     * ROOM
     * ==========================================
     */

    @NotNull(message = "Room is required.")
    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "room_id",
            nullable = false
    )
    private Room room;

    /*
     * ==========================================
     * AUDIT TIMESTAMPS
     * ==========================================
     */

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public Booking() {
    }

    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getGuestName() {
        return guestName;
    }

    public void setGuestName(String guestName) {
        this.guestName = guestName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getSpecialRequest() {
        return specialRequest;
    }

    public void setSpecialRequest(String specialRequest) {
        this.specialRequest = specialRequest;
    }

    public LocalDate getCheckIn() {
        return checkIn;
    }

    public void setCheckIn(LocalDate checkIn) {
        this.checkIn = checkIn;
    }

    public LocalDate getCheckOut() {
        return checkOut;
    }

    public void setCheckOut(LocalDate checkOut) {
        this.checkOut = checkOut;
    }

    public int getGuests() {
        return guests;
    }

    public void setGuests(int guests) {
        this.guests = guests;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public AppUser getCustomer() {
        return customer;
    }

    public void setCustomer(AppUser customer) {
        this.customer = customer;
    }

    public Room getRoom() {
        return room;
    }

    public void setRoom(Room room) {
        this.room = room;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}