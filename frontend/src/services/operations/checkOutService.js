import apiClient from "@/services/apiClient"


export async function checkOutBooking(
  bookingId
) {

  return apiClient(
    "/api/admin/check-out",
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


export async function employeeCheckOutBooking(
  bookingId
) {

  return apiClient(
    "/api/employee/check-out",
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
