import {
  getBookings,
  getBookingById,
  updateBookingStatus,
} from "@/services/bookingService"

export async function getAdminBookings() {
  return getBookings()
}

export async function getAdminBookingById(id) {
  return getBookingById(id)
}

export async function updateAdminBookingStatus(
  id,
  status
) {
  return updateBookingStatus(
    id,
    status
  )
}