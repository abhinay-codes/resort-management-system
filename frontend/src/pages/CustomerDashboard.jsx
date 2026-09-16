import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Eye,
  Hotel,
  XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { getMyBookings } from "@/services/customerBookingService"

function formatDate(date) {
  if (!date) {
    return "—"
  }

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  )
}

function formatCurrency(amount) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }
  ).format(amount ?? 0)
}

function formatStatus(status) {
  if (!status) {
    return "Unknown"
  }

  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function getStatusClasses(status) {
  switch (status) {
    case "CONFIRMED":
      return "bg-emerald-100 text-emerald-700"

    case "PENDING":
      return "bg-amber-100 text-amber-700"

    case "CHECKED_IN":
      return "bg-blue-100 text-blue-700"

    case "CHECKED_OUT":
      return "bg-slate-100 text-slate-700"

    case "CANCELLED":
      return "bg-red-100 text-red-700"

    default:
      return "bg-slate-100 text-slate-700"
  }
}

function CustomerDashboard() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  /*
   * ==========================================
   * LOAD CUSTOMER BOOKINGS
   * ==========================================
   */

  useEffect(() => {
    let mounted = true

    async function loadBookings() {
      try {
        setLoading(true)
        setError("")

        const data = await getMyBookings()

        if (!mounted) {
          return
        }

        setBookings(
          Array.isArray(data)
            ? data
            : []
        )
      } catch (err) {
        console.error(
          "Failed to load customer bookings:",
          err
        )

        if (!mounted) {
          return
        }

        setError(
          err?.message ||
            "Unable to load your bookings."
        )

        setBookings([])
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadBookings()

    return () => {
      mounted = false
    }
  }, [])

  /*
   * ==========================================
   * STATISTICS
   * ==========================================
   */

  const statistics = useMemo(() => {
    return {
      total: bookings.length,

      pending:
        bookings.filter(
          (booking) =>
            booking.status === "PENDING"
        ).length,

      confirmed:
        bookings.filter(
          (booking) =>
            booking.status === "CONFIRMED"
        ).length,

      completed:
        bookings.filter(
          (booking) =>
            booking.status === "CHECKED_OUT"
        ).length,
    }
  }, [bookings])

  /*
   * ==========================================
   * LOADING
   * ==========================================
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse space-y-6">

            <div className="h-10 w-72 rounded-lg bg-slate-200" />

            <div className="grid gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="h-32 rounded-2xl bg-slate-200"
                  />
                )
              )}
            </div>

            <div className="h-64 rounded-2xl bg-slate-200" />

          </div>
        </div>
      </main>
    )
  }

  /*
   * ==========================================
   * ERROR
   * ==========================================
   */

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-3xl">

          <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">

            <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />

            <h1 className="text-2xl font-semibold text-slate-900">
              Unable to load your bookings
            </h1>

            <p className="mt-3 text-slate-600">
              {error}
            </p>

            <div className="mt-6 flex justify-center">
              <Button
                onClick={() =>
                  window.location.reload()
                }
              >
                Try Again
              </Button>
            </div>

          </div>

        </div>
      </main>
    )
  }

  /*
   * ==========================================
   * PAGE
   * ==========================================
   */

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">

        {/* ======================================
            HEADER
        ====================================== */}

        <section className="mb-8">

          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Paradise Resort
          </p>

          <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">

            <div>

              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                My Bookings
              </h1>

              <p className="mt-2 text-slate-600">
                View and manage your resort
                reservations.
              </p>

            </div>

            <Link to="/booking">
              <Button>
                <CalendarDays className="mr-2 h-4 w-4" />
                Book a Room
              </Button>
            </Link>

          </div>

        </section>

        {/* ======================================
            STATISTICS
        ====================================== */}

        <section className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">

          {/* TOTAL */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Total Bookings
                </p>

                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {statistics.total}
                </p>

              </div>

              <div className="rounded-xl bg-slate-100 p-3">
                <Hotel className="h-5 w-5 text-slate-700" />
              </div>

            </div>

          </div>

          {/* PENDING */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Pending
                </p>

                <p className="mt-2 text-3xl font-semibold text-amber-600">
                  {statistics.pending}
                </p>

              </div>

              <div className="rounded-xl bg-amber-50 p-3">
                <Clock3 className="h-5 w-5 text-amber-600" />
              </div>

            </div>

          </div>

          {/* CONFIRMED */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Confirmed
                </p>

                <p className="mt-2 text-3xl font-semibold text-emerald-600">
                  {statistics.confirmed}
                </p>

              </div>

              <div className="rounded-xl bg-emerald-50 p-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>

            </div>

          </div>

          {/* COMPLETED */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Completed
                </p>

                <p className="mt-2 text-3xl font-semibold text-blue-600">
                  {statistics.completed}
                </p>

              </div>

              <div className="rounded-xl bg-blue-50 p-3">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>

            </div>

          </div>

        </section>

        {/* ======================================
            EMPTY STATE / BOOKING LIST
        ====================================== */}

        {bookings.length === 0 ? (

          <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">

            <Hotel className="mx-auto h-12 w-12 text-slate-400" />

            <h2 className="mt-5 text-xl font-semibold text-slate-900">
              No bookings yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-slate-600">
              Your confirmed and pending resort
              bookings will appear here.
            </p>

            <div className="mt-6">
              <Link to="/booking">
                <Button>
                  Make Your First Booking
                </Button>
              </Link>
            </div>

          </section>

        ) : (

          <section className="space-y-4">

            {bookings.map((booking) => (

              <article
                key={booking.id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              >

                <div className="p-6">

                  <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">

                    {/* ROOM / BOOKING */}

                    <div className="flex gap-4">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                        <Hotel className="h-5 w-5 text-slate-700" />
                      </div>

                      <div>

                        <div className="flex flex-wrap items-center gap-3">

                          <h2 className="text-lg font-semibold text-slate-900">

                            {booking.room?.name ||
                              `Room ${booking.room?.id ?? "—"}`}

                          </h2>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                              booking.status
                            )}`}
                          >
                            {formatStatus(
                              booking.status
                            )}
                          </span>

                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          Booking #{booking.id}
                        </p>

                      </div>

                    </div>

                    {/* AMOUNT */}

                    <div className="lg:text-right">

                      <p className="text-sm text-slate-500">
                        Total
                      </p>

                      <p className="mt-1 text-xl font-semibold text-slate-900">
                        {formatCurrency(
                          booking.totalAmount
                        )}
                      </p>

                    </div>

                  </div>

                  {/* DETAILS */}

                  <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">

                    <div>

                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Check-in
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {formatDate(
                          booking.checkIn
                        )}
                      </p>

                    </div>

                    <div>

                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Check-out
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {formatDate(
                          booking.checkOut
                        )}
                      </p>

                    </div>

                    <div>

                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Guests
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {booking.guests ?? "—"}
                      </p>

                    </div>

                  </div>

                  {/* ACTIONS */}

                  <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-5">

                    <Link
                      to={`/customer/bookings/${booking.id}`}
                    >
                      <Button variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        View Booking
                      </Button>
                    </Link>

                    {booking.status === "PENDING" && (
                      <Link
                        to={`/customer/bookings/${booking.id}`}
                      >
                        <Button>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Complete Payment
                        </Button>
                      </Link>
                    )}

                  </div>

                </div>

              </article>

            ))}

          </section>

        )}

      </div>
    </main>
  )
}

export default CustomerDashboard