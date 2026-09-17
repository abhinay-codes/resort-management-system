import apiClient from "@/services/apiClient"


export async function checkInBooking(bookingId) {

  return apiClient(
    "/api/admin/check-in",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        bookingId,
      }),
    }
  )
}


export async function employeeCheckInBooking(
  bookingId
) {

  return apiClient(
    "/api/employee/check-in",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        bookingId,
      }),
    }
  )
}
