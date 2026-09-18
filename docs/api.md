# API Reference

This document outlines the REST API endpoints provided by the Resort Management System backend. The API is secured using JWT authentication, and endpoints enforce Role-Based Access Control (RBAC).

## Authentication

All authentication endpoints are public.

| Method | Endpoint | Role | Purpose |
|--------|----------|------|---------|
| `POST` | `/api/auth/register` | Public | Registers a new Customer. Expects `email`, `password`, `name`. |
| `POST` | `/api/auth/login` | Public | Authenticates a user. Returns a signed JWT and user metadata. |

## Rooms

| Method | Endpoint | Role | Purpose |
|--------|----------|------|---------|
| `GET` | `/api/rooms` | Public | Returns a list of all rooms. |
| `GET` | `/api/rooms/{id}` | Public | Returns details of a specific room. |
| `GET` | `/api/rooms/{id}/availability` | Public | Checks if a specific room is available for the given `checkIn` and `checkOut` query parameters. |

## Public Bookings

| Method | Endpoint | Role | Purpose |
|--------|----------|------|---------|
| `GET` | `/api/bookings/{id}` | Public | Fetches a booking by its public ID. Used for the public booking lookup form. |

## Customer

Customer endpoints require `Role: CUSTOMER`. The backend explicitly verifies that the requested resource belongs to the authenticated user ID.

| Method | Endpoint | Role | Purpose |
|--------|----------|------|---------|
| `GET` | `/api/customer/bookings` | Customer | Returns all bookings belonging to the authenticated customer. |
| `GET` | `/api/customer/bookings/{id}` | Customer | Returns a specific booking belonging to the customer. |
| `POST` | `/api/customer/bookings` | Customer | Creates a new booking. Returns a `BookingResponse` in `PENDING` state. |
| `PUT` | `/api/customer/bookings/{id}/cancel` | Customer | Cancels a PENDING or CONFIRMED booking. Triggers refund if paid. |
| `GET` | `/api/customer/notifications` | Customer | Returns a list of recent notifications. |
| `GET` | `/api/customer/notifications/unread-count`| Customer | Returns the integer count of unread notifications. |
| `PUT` | `/api/customer/notifications/{id}/read` | Customer | Marks a specific notification as read. |

## Payments

Payments require authentication. Ownership logic is enforced internally.

| Method | Endpoint | Role | Purpose |
|--------|----------|------|---------|
| `GET` | `/api/payments/{paymentId}` | Any | Retrieves payment status. |
| `POST` | `/api/payments/{paymentId}/test` | Any | Simulated Demo Gateway: forcefully processes a successful demo payment, transitioning the booking to CONFIRMED. |
| `POST` | `/api/payments/{paymentId}/retry` | Customer | Retries a failed payment. |
| `POST` | `/api/payments/webhook` | System | External webhook endpoint for production gateway integrations. |

## Employee Operations

Employee endpoints require `Role: EMPLOYEE` (or `ADMIN`). They provide tools to run the day-to-day resort operations.

### Dashboard & Guests
| Method | Endpoint | Role | Purpose |
|--------|----------|------|---------|
| `GET` | `/api/employee/dashboard/summary` | Employee | Returns today's arrivals, departures, and active guests. |
| `GET` | `/api/employee/guests/search` | Employee | Searches active/past guests by name or email. |
| `GET` | `/api/employee/bookings` | Employee | Returns a paginated/filtered list of all bookings in the system. |

### Check-in / Check-out
| Method | Endpoint | Role | Purpose |
|--------|----------|------|---------|
| `POST` | `/api/employee/check-in/{bookingId}` | Employee | Processes check-in, updating booking to `CHECKED_IN` and room to `OCCUPIED`. |
| `POST` | `/api/employee/check-out/{bookingId}` | Employee | Processes check-out, updating booking to `CHECKED_OUT`, room to `CLEANING`, and generating a Housekeeping task. |

### Tasks
| Method | Endpoint | Role | Purpose |
|--------|----------|------|---------|
| `GET` | `/api/employee/housekeeping` | Employee | Returns all active housekeeping tasks. |
| `PUT` | `/api/employee/housekeeping/{id}/status` | Employee | Updates task status (`IN_PROGRESS`, `COMPLETED`). |
| `GET` | `/api/employee/maintenance` | Employee | Returns all active maintenance tasks. |
| `PUT` | `/api/employee/maintenance/{id}/status` | Employee | Updates maintenance task status (`IN_PROGRESS`, `RESOLVED`). |
| `POST` | `/api/employee/maintenance/room/{roomId}`| Employee | Reports a new maintenance issue, transitioning the room to `MAINTENANCE`. |

## Admin Operations

Admin endpoints require `Role: ADMIN`. Admins have access to all Employee endpoints via their respective `/api/admin/...` paths, plus the following exclusive endpoints.

### Users & Staff
| Method | Endpoint | Role | Purpose |
|--------|----------|------|---------|
| `GET` | `/api/admin/users/customers` | Admin | Returns all registered customers. |
| `GET` | `/api/admin/staff/employees` | Admin | Returns all staff members. |
| `POST` | `/api/admin/staff/employees` | Admin | Creates a new employee account. |
| `PUT` | `/api/admin/users/{id}/enabled` | Admin | Toggles the active/enabled status of a user. |

### Analytics
| Method | Endpoint | Role | Purpose |
|--------|----------|------|---------|
| `GET` | `/api/admin/analytics/summary` | Admin | Returns high-level KPIs (Total Revenue, Total Bookings, Occupancy). |
| `GET` | `/api/admin/analytics/monthly` | Admin | Returns revenue and booking volume grouped by month. |
| `GET` | `/api/admin/analytics/rooms` | Admin | Returns revenue performance grouped by room type. |

### Task Assignment
| Method | Endpoint | Role | Purpose |
|--------|----------|------|---------|
| `PUT` | `/api/admin/housekeeping/{id}/assign` | Admin | Assigns a specific employee to a housekeeping task. |
| `PUT` | `/api/admin/maintenance/{id}/assign` | Admin | Assigns a specific employee to a maintenance task. |

