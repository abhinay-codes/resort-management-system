import apiClient from "@/services/apiClient"

export async function getOperationsDashboard() {
  return apiClient("/api/admin/dashboard")
}

export async function getEmployeeOperationsDashboard() {
  return apiClient("/api/employee/dashboard")
}