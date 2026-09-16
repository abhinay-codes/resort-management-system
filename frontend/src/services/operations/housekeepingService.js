import apiClient from "@/services/apiClient"

export async function getHousekeepingTasks() {
  return apiClient("/api/admin/housekeeping")
}

export async function createHousekeepingTask(
  roomId,
  employeeId,
  notes
) {
  return apiClient("/api/admin/housekeeping", {
    method: "POST",
    body: JSON.stringify({
      roomId,
      employeeId,
      notes,
    }),
  })
}

export async function assignHousekeepingTask(
  taskId,
  employeeId
) {
  return apiClient(
    `/api/admin/housekeeping/${taskId}/assign`,
    {
      method: "PUT",
      body: JSON.stringify({
        employeeId,
      }),
    }
  )
}

export async function cancelHousekeepingTask(taskId) {
  return apiClient(
    `/api/admin/housekeeping/${taskId}/cancel`,
    {
      method: "PUT",
    }
  )
}

export async function getMyHousekeepingTasks() {
  return apiClient("/api/employee/housekeeping")
}

export async function updateMyHousekeepingTaskStatus(
  taskId,
  status
) {
  return apiClient(
    `/api/employee/housekeeping/${taskId}/status?status=${encodeURIComponent(
      status
    )}`,
    {
      method: "PUT",
    }
  )
}