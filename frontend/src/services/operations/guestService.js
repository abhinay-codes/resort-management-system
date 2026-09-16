import apiClient from "@/services/apiClient"

export async function searchGuest(email) {
  return apiClient(
    `/api/admin/guests/search?email=${encodeURIComponent(email)}`
  )
}

export async function searchEmployeeGuest(email) {
  return apiClient(
    `/api/employee/guests/search?email=${encodeURIComponent(email)}`
  )
}