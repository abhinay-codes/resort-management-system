import {
  apiRequest,
} from "@/services/apiClient"


const API_URL =
  "/api/employee/bookings"


/*
 * ==========================================
 * GET EMPLOYEE BOOKINGS
 * ==========================================
 */

export async function getEmployeeBookings() {

  return apiRequest(
    API_URL,
    {
      auth: true,

      fallbackMessage:
        "Failed to fetch bookings.",
    }
  )

}


/*
 * ==========================================
 * GET EMPLOYEE BOOKING BY ID
 * ==========================================
 *
 * Used by BookingDetails.jsx when an
 * employee opens a specific booking.
 */

export async function getEmployeeBookingById(
  id
) {

  return apiRequest(
    `${API_URL}/${id}`,
    {
      auth: true,

      fallbackMessage:
        "Failed to fetch booking.",
    }
  )

}


/*
 * ==========================================
 * UPDATE EMPLOYEE BOOKING STATUS
 * ==========================================
 */

export async function updateEmployeeBookingStatus(
  id,
  status
) {

  const params =
    new URLSearchParams({
      status,
    })


  return apiRequest(
    `${API_URL}/${id}/status?${params}`,
    {
      method: "PUT",

      auth: true,

      fallbackMessage:
        "Failed to update booking status.",
    }
  )

}