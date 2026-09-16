# Resort Management System — Agent Instructions

## Main Goal

Build and maintain a reliable production-style Resort Management System.

Priorities, in order:

1. Correct business behavior
2. Security and authorization
3. Consistent backend/frontend behavior
4. Clean and maintainable structure
5. Reliable database state
6. Good user experience

Do not add functionality, abstractions, libraries, UI elements, or code merely to make the project look more complete.

Prefer simple, correct solutions over unnecessary complexity.

The current repository is always the source of truth. Inspect the existing code before making changes.

---

## Technology

Backend:
- Java
- Spring Boot
- Maven
- PostgreSQL
- JPA
- Spring Security
- JWT

Frontend:
- React
- Vite
- Tailwind CSS
- shadcn/ui

Roles:
- ADMIN
- EMPLOYEE
- CUSTOMER

---

## General Rules

- Inspect before modifying.
- Search references before changing shared classes, services, APIs, entities, or components.
- Do not blindly delete or rewrite files.
- Do not introduce unnecessary abstractions or refactoring.
- Preserve working functionality.
- Keep naming and structure consistent with the existing project.
- Keep frontend, backend, and database behavior synchronized.
- Business rules must be enforced by the backend, not only by the frontend.
- Do not expose secrets or sensitive information.
- Never hard-code passwords, JWT secrets, API keys, or payment secrets.
- Do not modify `.env` files unless explicitly requested.
- Do not modify generated files such as `target`, `node_modules`, or `dist`.
- Do not claim tests passed unless they were actually run.

---

## Business Logic

### Booking

A booking follows:

PENDING → CONFIRMED → CHECKED_IN → CHECKED_OUT

Cancellation is allowed from:

PENDING → CANCELLED
CONFIRMED → CANCELLED

A checked-in or checked-out booking must not be cancelled.

Do not allow arbitrary booking status changes that bypass the normal lifecycle.

Booking creation must validate, as applicable:

- room exists
- dates are valid
- check-in/check-out dates are valid
- guest count is within room capacity
- room can be booked
- booking dates do not overlap an active booking
- total amount is calculated correctly

Customer bookings must belong to the authenticated customer.

---

## Payments

Payment states:

PENDING
SUCCESS
FAILED
REFUNDED

Normal payment flow:

PENDING → SUCCESS
PENDING → FAILED
FAILED → PENDING
SUCCESS → REFUNDED

Rules:

- A cancelled booking cannot be paid.
- A cancelled booking cannot retry payment.
- A booking becomes CONFIRMED only after successful payment.
- A successful payment may be refunded only when the booking lifecycle permits cancellation.
- Checked-out bookings must not be cancelled or refunded.
- Customer payment operations must verify ownership.
- Repeated payment/refund operations must be handled safely and consistently.

Payment and booking state must never contradict each other.

---

## Check-In

Check-in is a business operation, not simply a status update.

The check-in process must validate the current booking and room state before changing anything.

Normal result:

CONFIRMED booking → CHECKED_IN
Room → OCCUPIED

Do not bypass the check-in workflow by directly changing the booking status.

---

## Check-Out

Check-out is a business operation.

Normal result:

CHECKED_IN booking → CHECKED_OUT
Room → CLEANING
Housekeeping task → created

Do not bypass the check-out workflow by directly changing the booking status.

---

## Housekeeping

Housekeeping is responsible for preparing a room after checkout or when a cleaning task is required.

Normal lifecycle:

PENDING → IN_PROGRESS → COMPLETED

When housekeeping is completed, the room should return to the correct available state according to the current implementation.

Housekeeping and maintenance must not create contradictory room states or operational tasks.

---

## Maintenance

Maintenance represents a room requiring repair or maintenance work.

Maintenance must be treated as an operational workflow, not merely a room-status toggle.

Maintenance operations must consider:

- current room state
- bookings
- housekeeping
- check-in/check-out
- maintenance work already in progress

Never create a room state that contradicts an active booking or another operational process.

Do not silently cancel or alter bookings simply because a room is placed into maintenance unless the business rule explicitly requires that action.

---

## Room State

Room states currently include:

AVAILABLE
BOOKED
OCCUPIED
CLEANING
MAINTENANCE

Room state changes must be consistent with booking, check-in, check-out, housekeeping, and maintenance operations.

Do not allow arbitrary state changes that can create impossible combinations.

---

## Authentication and Authorization

Security is a core requirement.

Backend authorization must be enforced for every protected operation.

ADMIN, EMPLOYEE, and CUSTOMER permissions must remain separate.

Customers must only access their own protected bookings and payments.

Do not rely on frontend route protection for security.

JWT authentication and existing security configuration must not be weakened or bypassed.

---

## API Consistency

Whenever an API is changed:

- inspect the backend controller
- inspect its service
- inspect request/response DTOs
- inspect the frontend service using it
- inspect the pages/components using it

Keep request formats, response formats, authentication, authorization, and error handling synchronized.

Do not fix a backend problem by creating an inconsistent frontend workaround.

---

## Database Consistency

Entity changes must consider:

- existing database records
- repositories
- services
- DTOs
- API behavior
- frontend consumers

Do not casually remove or rename persistent fields.

Avoid changes that can leave bookings, payments, rooms, housekeeping, or maintenance in contradictory states.

---

## Code Structure

Follow the existing project architecture.

Backend responsibilities should remain separated:

Controller
→ Service
→ Repository

Use DTOs where the existing architecture requires them.

Keep business logic in services rather than duplicating it across controllers or frontend components.

Frontend API communication should remain inside the existing service structure rather than being duplicated throughout pages.

Do not reorganize the project unless there is a real architectural reason.

---

## Changes

For a significant change:

1. Inspect the current implementation.
2. Identify affected files and dependencies.
3. Understand the business rule involved.
4. Make the smallest correct change.
5. Check related frontend/backend/database code.
6. Run appropriate tests/builds.
7. Review the final diff.
8. Confirm that unrelated functionality was not changed.

If the requirement is unclear, inspect the existing implementation first rather than guessing.

---

## Quality Standard

The project should be:

- accurate
- secure
- consistent
- synchronized
- maintainable
- reliable

Do not add unnecessary features or complexity.

Do not optimize for appearance over correctness.

Do not make changes simply because they are technically possible.

Every change should have a clear reason and should improve or correctly complete the requested functionality.