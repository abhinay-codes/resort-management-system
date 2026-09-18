import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { CalendarDays, Eye, RefreshCcw } from "lucide-react"

import {
  getAdminBookings,
  updateAdminBookingStatus,
} from "@/services/admin/adminBookingService"
import { checkInBooking } from "@/services/operations/checkInService"
import { checkOutBooking } from "@/services/operations/checkOutService"

import { PageHeader } from "@/components/ui/PageHeader"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { EmptyState } from "@/components/ui/EmptyState"
import { Button } from "@/components/ui/button"

export default function AdminBookings() {
  const navigate = useNavigate()
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
      setError(err?.message || "Unable to load bookings.")
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

      setBookings((current) =>
        current.map((b) => (b.id === id ? updatedBooking : b))
      )
    } catch (err) {
      console.error("Failed to update booking status:", err)
      setError(err?.message || "Unable to update booking status.")
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-7xl animate-pulse space-y-8">
          <div className="h-10 w-64 bg-slate-200 rounded-lg" />
          <div className="h-[500px] bg-slate-200 rounded-3xl" />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          eyebrow="Resort Administration"
          title="Manage Bookings"
          description="View and manage all resort bookings globally."
          action={
            <Button variant="outline" onClick={loadBookings} className="bg-white">
              <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
            </Button>
          }
        />

        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No bookings found"
            description="There are currently no bookings in the system."
          />
        ) : (
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-[1000px] w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">ID</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Guest</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Room</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Check-in</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Check-out</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Amount</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-5 font-semibold text-slate-900">#{booking.id}</td>
                      <td className="px-6 py-5">
                        <p className="font-medium text-slate-900">{booking.guestName}</p>
                        <p className="text-xs text-slate-500">{booking.email}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-medium text-slate-900">{booking.room?.name || "Room"}</p>
                        <p className="text-xs text-slate-500">{booking.guests} guests</p>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-600">{booking.checkIn}</td>
                      <td className="px-6 py-5 text-sm text-slate-600">{booking.checkOut}</td>
                      <td className="px-6 py-5 font-medium text-slate-900">₹{Number(booking.totalAmount).toLocaleString("en-IN")}</td>
                      <td className="px-6 py-5">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <Link to={`/bookings/${booking.id}`}>
                            <Button variant="outline" size="sm" className="bg-white">View</Button>
                          </Link>

                          {booking.status === "PENDING" && (
                            <>
                              <Button size="sm" disabled={updatingId === booking.id} onClick={() => handleStatusChange(booking.id, "CONFIRMED")}>
                                Confirm
                              </Button>
                              <Button variant="outline" size="sm" disabled={updatingId === booking.id} onClick={() => handleStatusChange(booking.id, "CANCELLED")}>
                                Cancel
                              </Button>
                            </>
                          )}

                          {booking.status === "CONFIRMED" && (
                            <Button size="sm" disabled={updatingId === booking.id} onClick={() => handleStatusChange(booking.id, "CHECKED_IN")}>
                              Check In
                            </Button>
                          )}

                          {booking.status === "CHECKED_IN" && (
                            <Button size="sm" disabled={updatingId === booking.id} onClick={() => handleStatusChange(booking.id, "CHECKED_OUT")}>
                              Check Out
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden divide-y divide-slate-100">
              {bookings.map((booking) => (
                <div key={booking.id} className="p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 mb-1 block">#{booking.id}</span>
                      <h3 className="font-semibold text-slate-900">{booking.guestName}</h3>
                      <p className="text-sm text-slate-500">{booking.room?.name || "Room"}</p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm bg-slate-50 p-3 rounded-xl">
                    <div>
                      <p className="text-slate-500 text-xs uppercase tracking-wider">Check In</p>
                      <p className="font-medium text-slate-900">{booking.checkIn}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs uppercase tracking-wider">Check Out</p>
                      <p className="font-medium text-slate-900">{booking.checkOut}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/bookings/${booking.id}`)} className="flex-1 bg-white">
                      View
                    </Button>

                    {booking.status === "PENDING" && (
                      <Button size="sm" disabled={updatingId === booking.id} onClick={() => handleStatusChange(booking.id, "CONFIRMED")} className="flex-1">Confirm</Button>
                    )}

                    {booking.status === "CONFIRMED" && (
                      <Button size="sm" disabled={updatingId === booking.id} onClick={() => handleStatusChange(booking.id, "CHECKED_IN")} className="flex-1">Check In</Button>
                    )}

                    {booking.status === "CHECKED_IN" && (
                      <Button size="sm" disabled={updatingId === booking.id} onClick={() => handleStatusChange(booking.id, "CHECKED_OUT")} className="flex-1">Check Out</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
