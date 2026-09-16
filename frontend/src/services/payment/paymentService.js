import apiRequest from "@/services/apiClient"

export async function createPayment(bookingId) {
  return apiRequest(
    `/api/payments/booking/${bookingId}`,
    {
      method: "POST",
      auth: true,
    }
  )
}

export async function getPaymentByBooking(bookingId) {
  return apiRequest(
    `/api/payments/booking/${bookingId}`,
    {
      auth: true,
    }
  )
}

export async function getPayment(paymentId) {
  return apiRequest(
    `/api/payments/${paymentId}`,
    {
      auth: true,
    }
  )
}

export async function processTestPayment(
  paymentId,
  success = true
) {
  return apiRequest(
    `/api/payments/${paymentId}/test`,
    {
      method: "POST",
      auth: true,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success,
      }),
    }
  )
}

export async function retryPayment(paymentId) {
  return apiRequest(
    `/api/payments/${paymentId}/retry`,
    {
      method: "POST",
      auth: true,
    }
  )
}

export async function getPaymentHistory() {
  return apiRequest(
    "/api/payments/history",
    {
      auth: true,
    }
  )
}