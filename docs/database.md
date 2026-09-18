# Database Architecture

This document describes the persistence layer of the Resort Management System.

## Database Technology
- **Engine:** PostgreSQL (version 15, via Alpine Docker image)
- **Database Name:** `resort_management`

## Persistence
The application uses **Spring Data JPA** with **Hibernate** as the JPA provider to map Java objects to database tables.

## Schema Generation
The project currently relies on Hibernate's automatic schema generation:
`spring.jpa.hibernate.ddl-auto=update`

This instructs Hibernate to inspect the Entity classes on startup and automatically create or update tables to match. While suitable for initial development and demonstrations, production environments should transition to a migration tool like Flyway or Liquibase.

## Entity Model & ER Diagram

```mermaid
erDiagram
    USERS {
        Long id PK
        String email UK
        String password
        String name
        String role "CUSTOMER, EMPLOYEE, ADMIN"
        Boolean enabled
    }
    
    ROOM {
        Long id PK
        String name
        String description
        Double price
        Integer guests
        String status "AVAILABLE, BOOKED, OCCUPIED..."
        String image
    }
    
    BOOKING {
        Long id PK
        LocalDate check_in
        LocalDate check_out
        Integer guests
        String guest_name
        String email
        String phone
        String special_request
        Double total_amount
        String status "PENDING, CONFIRMED, CHECKED_IN..."
        Timestamp created_at
        Timestamp updated_at
        Long room_id FK
        Long customer_id FK
    }
    
    PAYMENT {
        Long id PK
        Double amount
        String status "PENDING, SUCCESS, FAILED, REFUNDED"
        String payment_method
        String payment_reference
        String gateway_order_id
        String gateway_payment_id
        Timestamp created_at
        Timestamp updated_at
        Long booking_id FK
    }
    
    HOUSEKEEPING_TASK {
        Long id PK
        String description
        String status "PENDING, IN_PROGRESS, COMPLETED, CANCELLED"
        Timestamp created_at
        Timestamp updated_at
        Timestamp completed_at
        Long room_id FK
        Long assigned_to_id FK
    }
    
    MAINTENANCE_TASK {
        Long id PK
        String issue_description
        String status "OPEN, IN_PROGRESS, RESOLVED, CANCELLED"
        String priority
        Timestamp created_at
        Timestamp updated_at
        Timestamp resolved_at
        Long room_id FK
        Long reported_by_id FK
        Long assigned_to_id FK
    }
    
    NOTIFICATION {
        Long id PK
        String title
        String message
        String type
        Boolean is_read
        String idempotency_key UK
        Timestamp created_at
        Long customer_id FK
        Long booking_id FK
    }

    USERS ||--o{ BOOKING : "places"
    USERS ||--o{ NOTIFICATION : "receives"
    USERS ||--o{ MAINTENANCE_TASK : "reports / assigned to"
    USERS ||--o{ HOUSEKEEPING_TASK : "assigned to"
    
    ROOM ||--o{ BOOKING : "has"
    ROOM ||--o{ HOUSEKEEPING_TASK : "requires"
    ROOM ||--o{ MAINTENANCE_TASK : "requires"
    
    BOOKING ||--o| PAYMENT : "paid via"
    BOOKING ||--o{ NOTIFICATION : "triggers"
```

## Relationship Explanation

- **User → Booking (`@ManyToOne`):** A single User (Customer) can place multiple Bookings, but a Booking strictly belongs to one Customer.
- **Room → Booking (`@ManyToOne`):** A specific Room can have many historical or future Bookings, but a single Booking reserves exactly one Room.
- **Booking → Payment (`@OneToOne`):** A Booking maps to exactly one Payment lifecycle record.
- **Room → HousekeepingTask / MaintenanceTask (`@ManyToOne`):** A Room can accumulate multiple operational task records over time.
- **User → MaintenanceTask / HousekeepingTask (`@ManyToOne`):** Employees (Users) can be assigned to multiple tasks. Maintenance tasks also track the User who reported the issue.
- **User → Notification (`@ManyToOne`):** A Customer receives multiple Notifications over time.
- **Booking → Notification (`@ManyToOne`):** A specific Booking (e.g., confirmation event) can trigger specific Notifications.

