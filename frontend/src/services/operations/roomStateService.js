import apiClient from "@/services/apiClient"

export async function updateRoomState(
  roomId,
  status
) {
  return apiClient(
    `/api/admin/room-state/${roomId}?status=${encodeURIComponent(
      status
    )}`,
    {
      method: "PUT",
    }
  )
}