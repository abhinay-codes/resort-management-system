import apiClient from "@/services/apiClient"

export async function getEmployees() {
  return apiClient("/api/admin/staff/employees")
}