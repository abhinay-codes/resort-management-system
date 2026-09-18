import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, SlidersHorizontal, UserSquare, CalendarDays, ReceiptText } from "lucide-react"

import {
  getEmployeeBookings,
  updateEmployeeBookingStatus,
} from "@/services/employeeBookingService"
import { employeeCheckInBooking } from "@/services/operations/checkInService"
import { employeeCheckOutBooking } from "@/services/operations/checkOutService"
import { PageHeader } from "@/components/ui/PageHeader"
import { StatCard } from "@/components/ui/StatCard"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/EmptyState"

function formatAmount(amount) {
  return `₹${Number(amount).toLocaleString("en-IN")}`
}

function EmployeeHome() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [updatingId, setUpdatingId] = useState(null)

  async function loadBookings() {
    try {
      setLoading(true)
      setError("")
      const data = await getEmployeeBookings()
      setBookings(Array.isArray(data) ? data : [])
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch bookings.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [])

  async function handleStatusChange(booking, newStatus) {
    try {
      setUpdatingId(booking.id)
      setError("")

      let updatedBooking
      if (newStatus === "CHECKED_IN") {
        updatedBooking = await employeeCheckInBooking(booking.id)
      } else if (newStatus === "CHECKED_OUT") {
        updatedBooking = await employeeCheckOutBooking(booking.id)
      } else {
        updatedBooking = await updateEmployeeBookingStatus(booking.id, newStatus)
      }

      setBookings((current) =>
        current.map((cb) => (cb.id === booking.id ? updatedBooking : cb))
      )
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update booking status.")
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    const searchText = search.toLowerCase().trim()
    const matchesSearch =
      !searchText ||
      booking.guestName?.toLowerCase().includes(searchText) ||
      booking.email?.toLowerCase().includes(searchText) ||
      booking.room?.name?.toLowerCase().includes(searchText)
    const matchesStatus = statusFilter === "ALL" || booking.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    pending: bookings.filter((b) => b.status === "PENDING").length,
    confirmed: bookings.filter((b) => b.status === "CONFIRMED").length,
    checkedIn: bookings.filter((b) => b.status === "CHECKED_IN").length,
    checkedOut: bookings.filter((b) => b.status === "CHECKED_OUT").length,
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-7xl animate-pulse space-y-8">
          <div className="h-10 w-72 bg-slate-200 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="h-32 bg-slate-200 rounded-2xl"></div>
            <div className="h-32 bg-slate-200 rounded-2xl"></div>
            <div className="h-32 bg-slate-200 rounded-2xl"></div>
            <div className="h-32 bg-slate-200 rounded-2xl"></div>
          </div>
          <div className="h-96 bg-slate-200 rounded-3xl"></div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          eyebrow="Paradise Resort"
          title="Employee Dashboard"
          description="Manage daily resort bookings and guest operations."
        />

        {error && (
          <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 sm:flex-row sm:items-center sm:justify-between">
            <p>{error}</p>
            <Button variant="outline" onClick={loadBookings} className="bg-white hover:bg-red-50">
              Retry
            </Button>
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          <StatCard title="Pending" value={stats.pending} />
          <StatCard title="Confirmed" value={stats.confirmed} />
          <StatCard title="Checked In" value={stats.checkedIn} />
          <StatCard title="Checked Out" value={stats.checkedOut} />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Filters */}
          <div className="border-b border-slate-100 p-6 bg-slate-50/50">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search guest, email or room..."
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>
              <div className="relative">
                <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full md:w-48 appearance-none rounded-xl border border-slate-200 py-3 pl-10 pr-10 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 bg-white"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="CHECKED_IN">Checked In</option>
                  <option value="CHECKED_OUT">Checked Out</option>
                </select>
              </div>
            </div>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="p-16 text-center text-slate-500">
              <p>No bookings match the current search criteria.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Guest</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Room</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Dates</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-900">{booking.guestName}</p>
                          <p className="text-sm text-slate-500">{booking.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-900">{booking.room?.name}</p>
                          <p className="text-sm text-slate-500">{booking.guests} guests</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-900">{booking.checkIn}</p>
                          <p className="text-sm text-slate-500">to {booking.checkOut}</p>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={booking.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => navigate(`/bookings/${booking.id}`)}>
                              View
                            </Button>

                            {booking.status === "PENDING" && (
                              <>
                                <Button size="sm" disabled={updatingId === booking.id} onClick={() => handleStatusChange(booking, "CONFIRMED")}>
                                  Confirm
                                </Button>
                                <Button variant="outline" size="sm" disabled={updatingId === booking.id} onClick={() => handleStatusChange(booking, "CANCELLED")}>
                                  Cancel
                                </Button>
                              </>
                            )}

                            {booking.status === "CONFIRMED" && (
                              <>
                                <Button size="sm" disabled={updatingId === booking.id} onClick={() => handleStatusChange(booking, "CHECKED_IN")}>
                                  Check In
                                </Button>
                                <Button variant="outline" size="sm" disabled={updatingId === booking.id} onClick={() => handleStatusChange(booking, "CANCELLED")}>
                                  Cancel
                                </Button>
                              </>
                            )}

                            {booking.status === "CHECKED_IN" && (
                              <Button size="sm" disabled={updatingId === booking.id} onClick={() => handleStatusChange(booking, "CHECKED_OUT")}>
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

              {/* Mobile Cards */}
              <div className="md:hidden flex flex-col divide-y divide-slate-100">
                {filteredBookings.map((booking) => (
                  <div key={booking.id} className="p-5 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-900">{booking.guestName}</h3>
                        <p className="text-sm text-slate-500">{booking.room?.name}</p>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-slate-500">Check In</p>
                        <p className="font-medium text-slate-900">{booking.checkIn}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Check Out</p>
                        <p className="font-medium text-slate-900">{booking.checkOut}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/bookings/${booking.id}`)} className="flex-1">
                        View
                      </Button>

                      {booking.status === "PENDING" && (
                        <>
                          <Button size="sm" disabled={updatingId === booking.id} onClick={() => handleStatusChange(booking, "CONFIRMED")} className="flex-1">Confirm</Button>
                          <Button variant="outline" size="sm" disabled={updatingId === booking.id} onClick={() => handleStatusChange(booking, "CANCELLED")} className="flex-1">Cancel</Button>
                        </>
                      )}

                      {booking.status === "CONFIRMED" && (
                        <>
                          <Button size="sm" disabled={updatingId === booking.id} onClick={() => handleStatusChange(booking, "CHECKED_IN")} className="flex-1">Check In</Button>
                          <Button variant="outline" size="sm" disabled={updatingId === booking.id} onClick={() => handleStatusChange(booking, "CANCELLED")} className="flex-1">Cancel</Button>
                        </>
                      )}

                      {booking.status === "CHECKED_IN" && (
                        <Button size="sm" disabled={updatingId === booking.id} onClick={() => handleStatusChange(booking, "CHECKED_OUT")} className="flex-1">Check Out</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

export default EmployeeHome
