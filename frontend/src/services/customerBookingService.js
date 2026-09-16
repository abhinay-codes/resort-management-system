import apiRequest from "@/services/apiClient"

export async function getMyBookings() {
  return apiRequest("/api/customer/bookings", {
    auth: true,
  })
}

export async function getMyBooking(bookingId) {
  return apiRequest(`/api/customer/bookings/${bookingId}`, {
    auth: true,
  })
}

export async function createCustomerBooking(bookingData) {
  return apiRequest("/api/customer/bookings", {
    method: "POST",
    auth: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bookingData),
  })
}

export async function cancelMyBooking(bookingId) {
  return apiRequest(
    `/api/customer/bookings/${bookingId}/cancel`,
    {
      method: "PATCH",
      auth: true,
    }
  )
}