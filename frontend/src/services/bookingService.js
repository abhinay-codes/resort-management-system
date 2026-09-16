import { apiRequest } from "@/services/apiClient"

const PUBLIC_API_URL =
  "/api/bookings"

const ADMIN_API_URL =
  "/api/admin/bookings"

/*
 * ==========================================
 * CREATE BOOKING
 * ==========================================
 *
 * auth: true is intentional.
 *
 * If the user is logged in as CUSTOMER,
 * apiClient will attach the JWT.
 *
 * Backend then knows:
 *
 * CUSTOMER
 *    ↓
 * authenticated email
 *    ↓
 * AppUser
 *    ↓
 * Booking.customer
 *
 * If the user is not logged in, apiClient can
 * simply make the request without a token and
 * the backend can still handle it as a guest
 * booking.
 */
export async function createBooking(bookingData) {
  return apiRequest(
    PUBLIC_API_URL,
    {
      method: "POST",

      /*
       * IMPORTANT:
       *
       * Previously this was false.
       *
       * That caused logged-in customers to create
       * anonymous/guest bookings.
       */
      auth: true,

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(bookingData),

      fallbackMessage:
        "Failed to create booking.",
    }
  )
}


/*
 * ==========================================
 * CUSTOMER BOOKING LOOKUP
 * ==========================================
 *
 * Used by the public booking lookup page.
 *
 * This is intentionally public because a guest
 * can find a booking using:
 *
 * booking ID + email
 */
export async function lookupCustomerBooking(
  id,
  email
) {
  const params =
    new URLSearchParams({
      email: email.trim(),
    })

  return apiRequest(
    `${PUBLIC_API_URL}/${id}?${params}`,
    {
      auth: false,

      fallbackMessage:
        "Booking reference or email is incorrect.",
    }
  )
}


/*
 * ==========================================
 * ADMIN: GET BOOKING
 * ==========================================
 */
export async function getBookingById(id) {
  return apiRequest(
    `${ADMIN_API_URL}/${id}`,
    {
      auth: true,

      fallbackMessage:
        "Failed to fetch booking.",
    }
  )
}


/*
 * ==========================================
 * ADMIN: GET ALL BOOKINGS
 * ==========================================
 */
export async function getBookings() {
  return apiRequest(
    ADMIN_API_URL,
    {
      auth: true,

      fallbackMessage:
        "Failed to fetch bookings.",
    }
  )
}


/*
 * ==========================================
 * ADMIN: UPDATE BOOKING STATUS
 * ==========================================
 */
export async function updateBookingStatus(
  id,
  status
) {
  const params =
    new URLSearchParams({
      status,
    })

  return apiRequest(
    `${ADMIN_API_URL}/${id}/status?${params}`,
    {
      method: "PUT",

      auth: true,

      fallbackMessage:
        "Failed to update booking status.",
    }
  )
}