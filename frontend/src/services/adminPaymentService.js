import apiRequest from "@/services/apiClient"

export async function getAllPayments() {
  return apiRequest("/api/admin/payments", {
    auth: true,
  })
}

export async function getPaymentById(paymentId) {
  return apiRequest(`/api/admin/payments/${paymentId}`, {
    auth: true,
  })
}

export async function refundPayment(paymentId) {
  return apiRequest(`/api/admin/payments/${paymentId}/refund`, {
    method: "POST",
    auth: true,
  })
}

export async function getRevenue() {
  return apiRequest("/api/admin/payments/statistics/revenue", {
    auth: true,
  })
}
