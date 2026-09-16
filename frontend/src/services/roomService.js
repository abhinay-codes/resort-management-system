import { apiRequest } from "@/services/apiClient"


const API_URL =
  "/api/rooms"


/*
 * ==========================================
 * GET ALL ROOMS
 * ==========================================
 */

export async function getRooms() {

  return apiRequest(
    API_URL,
    {
      auth: false,

      fallbackMessage:
        "Failed to fetch rooms.",
    }
  )

}


/*
 * ==========================================
 * GET ROOM BY ID
 * ==========================================
 */

export async function getRoomById(
  id
) {

  return apiRequest(
    `${API_URL}/${id}`,
    {
      auth: false,

      fallbackMessage:
        "Room not found.",
    }
  )

}


/*
 * ==========================================
 * CHECK ROOM AVAILABILITY
 * ==========================================
 */

export async function checkRoomAvailability(
  roomId,
  checkIn,
  checkOut
) {

  const params =
    new URLSearchParams({
      checkIn,
      checkOut,
    })


  return apiRequest(
    `${API_URL}/${roomId}/availability?${params}`,
    {
      auth: false,

      fallbackMessage:
        "Failed to check room availability.",
    }
  )

}