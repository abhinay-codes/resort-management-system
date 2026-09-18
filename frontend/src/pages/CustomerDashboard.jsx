import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { CalendarDays, Hotel, XCircle, Eye, CreditCard } from "lucide-react"

import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { PageHeader } from "@/components/ui/PageHeader"
import { EmptyState } from "@/components/ui/EmptyState"
import { getMyBookings } from "@/services/customerBookingService"

function formatDate(date) {
  if (!date) return "—"
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount ?? 0)
}

function CustomerDashboard() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let mounted = true
    async function loadBookings() {
      try {
        setLoading(true)
        setError("")
        const data = await getMyBookings()
        if (!mounted) return
        setBookings(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!mounted) return
        setError(err?.message || "Unable to load your bookings.")
        setBookings([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadBookings()
    return () => { mounted = false }
  }, [])

  const { currentBooking, pastBookings } = useMemo(() => {
    const sorted = [...bookings].sort((a, b) => new Date(b.checkIn) - new Date(a.checkIn))
    const active = sorted.find(b => b.status === "CHECKED_IN") ||
                   sorted.find(b => b.status === "CONFIRMED") ||
                   sorted.find(b => b.status === "PENDING")
    const others = sorted.filter(b => b.id !== active?.id)
    return { currentBooking: active, pastBookings: others }
  }, [bookings])

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-72 rounded-lg bg-slate-200" />
            <div className="h-64 rounded-3xl bg-slate-200" />
            <div className="h-32 rounded-3xl bg-slate-200" />
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16 flex items-center justify-center">
        <div className="rounded-3xl border border-red-200 bg-white p-10 text-center shadow-sm max-w-lg w-full">
          <XCircle className="mx-auto mb-5 h-12 w-12 text-red-500" />
          <h1 className="text-2xl font-semibold text-slate-900">Unable to load dashboard</h1>
          <p className="mt-3 text-slate-600">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-8">
            Try Again
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <PageHeader
          eyebrow="Guest Portal"
          title="My Bookings"
          description="View and manage your resort reservations."
          action={
            <Link to="/booking">
              <Button>
                <CalendarDays className="mr-2 h-4 w-4" />
                Book a Room
              </Button>
            </Link>
          }
        />

        {bookings.length === 0 ? (
          <EmptyState
            icon={Hotel}
            title="No bookings yet"
            description="Your confirmed and pending resort bookings will appear here."
            action={
              <Link to="/booking">
                <Button>Make Your First Booking</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-12">
            {/* CURRENT / UPCOMING STAY */}
            {currentBooking && (
              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Current Stay</h2>
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <StatusBadge status={currentBooking.status} />
                        <span className="text-sm text-slate-500">Booking #{currentBooking.id}</span>
                      </div>
                      <h3 className="text-2xl font-semibold text-slate-900">
                        {currentBooking.room?.name || `Room ${currentBooking.room?.id ?? "—"}`}
                      </h3>
                      <p className="text-slate-600 mt-2">
                        {formatDate(currentBooking.checkIn)} — {formatDate(currentBooking.checkOut)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 lg:items-end">
                      <p className="text-2xl font-semibold text-slate-900">
                        {formatCurrency(currentBooking.totalAmount)}
                      </p>
                      <div className="flex gap-3">
                        {currentBooking.status === "PENDING" && (
                          <Link to={`/customer/bookings/${currentBooking.id}`}>
                            <Button>
                              <CreditCard className="mr-2 h-4 w-4" />
                              Complete Payment
                            </Button>
                          </Link>
                        )}
                        <Link to={`/customer/bookings/${currentBooking.id}`}>
                          <Button variant="outline" className="bg-white">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* PAST / OTHER BOOKINGS */}
            {pastBookings.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Other Bookings</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {pastBookings.map(booking => (
                    <div key={booking.id} className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:shadow-md flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <StatusBadge status={booking.status} />
                          <span className="text-sm text-slate-500">#{booking.id}</span>
                        </div>
                        <h4 className="text-lg font-medium text-slate-900">
                          {booking.room?.name || `Room ${booking.room?.id ?? "—"}`}
                        </h4>
                        <p className="text-sm text-slate-600 mt-1">
                          {formatDate(booking.checkIn)} — {formatDate(booking.checkOut)}
                        </p>
                      </div>
                      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                        <span className="font-medium text-slate-900">{formatCurrency(booking.totalAmount)}</span>
                        <Link to={`/customer/bookings/${booking.id}`} className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                          View details &rarr;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

export default CustomerDashboard
