import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import {
  getAdminBookings,
  updateAdminBookingStatus,
} from "@/services/admin/adminBookingService"

import {
  checkInBooking,
} from "@/services/operations/checkInService"

import {
  checkOutBooking,
} from "@/services/operations/checkOutService"

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    loadBookings()
  }, [])

  async function loadBookings() {
    try {
      setLoading(true)
      setError("")

      const data = await getAdminBookings()

      setBookings(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Failed to load admin bookings:", err)

      setError(
        err?.message || "Unable to load bookings."
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(id, status) {
    try {
      setUpdatingId(id)
      setError("")

      let updatedBooking

      if (status === "CHECKED_IN") {
        updatedBooking = await checkInBooking(id)
      } else if (status === "CHECKED_OUT") {
        updatedBooking = await checkOutBooking(id)
      } else {
        updatedBooking = await updateAdminBookingStatus(id, status)
      }

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking.id === id ? updatedBooking : booking
        )
      )
    } catch (err) {
      console.error(
        "Failed to update booking status:",
        err
      )

      setError(
        err?.message ||
          "Unable to update booking status."
      )
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-muted-foreground">
            Loading bookings...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        <div>
          <h1 className="text-3xl font-bold">
            Manage Bookings
          </h1>

          <p className="mt-2 text-muted-foreground">
            View and manage all resort bookings.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="rounded-xl border p-8 text-center">
            <p className="text-muted-foreground">
              No bookings found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[1000px] text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left">
                    ID
                  </th>

                  <th className="px-4 py-3 text-left">
                    Guest
                  </th>

                  <th className="px-4 py-3 text-left">
                    Room
                  </th>

                  <th className="px-4 py-3 text-left">
                    Check-in
                  </th>

                  <th className="px-4 py-3 text-left">
                    Check-out
                  </th>

                  <th className="px-4 py-3 text-left">
                    Guests
                  </th>

                  <th className="px-4 py-3 text-left">
                    Amount
                  </th>

                  <th className="px-4 py-3 text-left">
                    Status
                  </th>

                  <th className="px-4 py-3 text-left">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b last:border-0"
                  >
                    <td className="px-4 py-3 font-medium">
                      #{booking.id}
                    </td>

                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">
                          {booking.guestName}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {booking.email}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {booking.room?.name || "Room"}
                    </td>

                    <td className="px-4 py-3">
                      {booking.checkIn}
                    </td>

                    <td className="px-4 py-3">
                      {booking.checkOut}
                    </td>

                    <td className="px-4 py-3">
                      {booking.guests}
                    </td>

                    <td className="px-4 py-3">
                      ₹{booking.totalAmount}
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded-full border px-3 py-1 text-xs">
                        {booking.status}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">

                        {/* ==================================
                            ADMIN / EMPLOYEE MANAGEMENT VIEW
                            ==================================
                            
                            /booking/:id is the public
                            view-only booking page.

                            /bookings/:id is the protected
                            admin/employee management page.
                        */}
                        <Link
                          to={`/bookings/${booking.id}`}
                          className="rounded-lg border px-3 py-2 hover:bg-muted"
                        >
                          View
                        </Link>

                        {booking.status === "PENDING" && (
                          <>
                            <button
                              type="button"
                              disabled={
                                updatingId === booking.id
                              }
                              onClick={() =>
                                handleStatusChange(
                                  booking.id,
                                  "CONFIRMED"
                                )
                              }
                              className="rounded-lg border px-3 py-2 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {updatingId === booking.id
                                ? "Updating..."
                                : "Confirm"}
                            </button>

                            <button
                              type="button"
                              disabled={
                                updatingId === booking.id
                              }
                              onClick={() =>
                                handleStatusChange(
                                  booking.id,
                                  "CANCELLED"
                                )
                              }
                              className="rounded-lg border px-3 py-2 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {booking.status === "CONFIRMED" && (
                          <button
                            type="button"
                            disabled={
                              updatingId === booking.id
                            }
                            onClick={() =>
                              handleStatusChange(
                                booking.id,
                                "CHECKED_IN"
                              )
                            }
                            className="rounded-lg border px-3 py-2 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Check In
                          </button>
                        )}

                        {booking.status === "CHECKED_IN" && (
                          <button
                            type="button"
                            disabled={
                              updatingId === booking.id
                            }
                            onClick={() =>
                              handleStatusChange(
                                booking.id,
                                "CHECKED_OUT"
                              )
                            }
                            className="rounded-lg border px-3 py-2 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Check Out
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}