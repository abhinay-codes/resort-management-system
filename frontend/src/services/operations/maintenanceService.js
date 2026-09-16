import apiClient from "@/services/apiClient"

export async function getMaintenanceRooms() {
  return apiClient("/api/admin/maintenance")
}

export async function reportMaintenance(
  roomId,
  note
) {
  return apiClient(
    `/api/admin/maintenance/${roomId}`,
    {
      method: "POST",
      body: JSON.stringify({
        note,
      }),
    }
  )
}

export async function resolveMaintenance(
  roomId
) {
  return apiClient(
    `/api/admin/maintenance/${roomId}/resolve`,
    {
      method: "PUT",
    }
  )
}

export async function getEmployeeMaintenanceRooms() {
  return apiClient("/api/employee/maintenance")
}

export async function employeeReportMaintenance(
  roomId,
  note
) {
  return apiClient(
    `/api/employee/maintenance/${roomId}`,
    {
      method: "POST",
      body: JSON.stringify({
        note,
      }),
    }
  )
}

export async function employeeResolveMaintenance(
  roomId
) {
  return apiClient(
    `/api/employee/maintenance/${roomId}/resolve`,
    {
      method: "PUT",
    }
  )
}