import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  ArrowLeft,
  CalendarDays,
  Hotel,
  Loader2,
  Mail,
  Phone,
  Users,
} from "lucide-react"

import { getBookingById } from "@/services/bookingService"
import { Button } from "@/components/ui/button"

function formatDate(value) {
  if (!value) {
    return "—"
  }

  const date = new Date(`${value}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value ?? 0)
}

function getStatusClasses(status) {
  switch (status) {
    case "CONFIRMED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700"

    case "CHECKED_IN":
      return "border-blue-200 bg-blue-50 text-blue-700"

    case "CHECKED_OUT":
      return "border-slate-200 bg-slate-100 text-slate-700"

    case "CANCELLED":
      return "border-red-200 bg-red-50 text-red-700"

    case "PENDING":
    default:
      return "border-amber-200 bg-amber-50 text-amber-700"
  }
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

export default function PublicBookingDetails() {
  const { id } = useParams()

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadBooking() {
      try {
        setLoading(true)
        setError("")

        const data = await getBookingById(id)

        setBooking(data)
      } catch (err) {
        console.error(
          "Failed to load public booking:",
          err
        )

        setError(
          err?.message ||
            "Unable to find this booking."
        )
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadBooking()
    }
  }, [id])

  /*
   * ==========================================
   * LOADING
   * ==========================================
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">

        <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center">

          <div className="flex items-center gap-3 text-slate-600">

            <Loader2 className="h-5 w-5 animate-spin" />

            Loading booking details...

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

  if (error || !booking) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12">

        <div className="mx-auto max-w-3xl">

          <Link
            to="/booking-lookup"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Booking Lookup
          </Link>

          <section className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <Hotel className="h-7 w-7 text-red-500" />
            </div>

            <h1 className="mt-5 text-2xl font-semibold text-slate-900">
              Booking Not Found
            </h1>

            <p className="mt-3 text-slate-600">
              {error ||
                "We could not find a booking with this booking ID."}
            </p>

            <div className="mt-6">

              <Link to="/booking-lookup">
                <Button>
                  Search Again
                </Button>
              </Link>

            </div>

          </section>

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

      <div className="mx-auto max-w-5xl">

        {/* BACK */}

        <Link
          to="/booking-lookup"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Booking Lookup
        </Link>

        {/* HEADER */}

        <section className="mb-8">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

            <div>

              <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
                Paradise Resort
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Booking Details
              </h1>

              <p className="mt-2 text-slate-600">
                Booking #{booking.id}
              </p>

            </div>

            <span
              className={`w-fit rounded-full border px-4 py-2 text-sm font-semibold ${getStatusClasses(
                booking.status
              )}`}
            >
              {formatStatus(booking.status)}
            </span>

          </div>

        </section>

        {/* MAIN GRID */}

        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">

          {/* RESERVATION */}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-slate-900">
              Reservation
            </h2>

            <div className="mt-6 space-y-6">

              {/* ROOM */}

              <div className="flex items-start gap-4">

                <div className="rounded-xl bg-slate-100 p-3">
                  <Hotel className="h-5 w-5 text-slate-700" />
                </div>

                <div>

                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Room
                  </p>

                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {booking.room?.name ||
                      `Room #${booking.room?.id ?? "—"}`}
                  </p>

                </div>

              </div>

              {/* DATES */}

              <div className="flex items-start gap-4">

                <div className="rounded-xl bg-slate-100 p-3">
                  <CalendarDays className="h-5 w-5 text-slate-700" />
                </div>

                <div>

                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Stay
                  </p>

                  <p className="mt-1 font-medium text-slate-900">
                    {formatDate(booking.checkIn)}
                    {" → "}
                    {formatDate(booking.checkOut)}
                  </p>

                </div>

              </div>

              {/* GUESTS */}

              <div className="flex items-start gap-4">

                <div className="rounded-xl bg-slate-100 p-3">
                  <Users className="h-5 w-5 text-slate-700" />
                </div>

                <div>

                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Guests
                  </p>

                  <p className="mt-1 font-medium text-slate-900">
                    {booking.guests ?? "—"}
                  </p>

                </div>

              </div>

            </div>

          </section>

          {/* BOOKING SUMMARY */}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <p className="text-sm font-medium text-slate-500">
              Total Amount
            </p>

            <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
              {formatCurrency(
                booking.totalAmount
              )}
            </p>

            <div className="mt-6 border-t border-slate-100 pt-5">

              <p className="text-sm text-slate-500">
                Booking Status
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {formatStatus(booking.status)}
              </p>

            </div>

            {booking.room?.description && (
              <div className="mt-6 border-t border-slate-100 pt-5">

                <p className="text-sm text-slate-500">
                  Room Description
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {booking.room.description}
                </p>

              </div>
            )}

          </section>

        </div>

        {/* GUEST INFORMATION */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-semibold text-slate-900">
            Guest Information
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">

            <div className="flex items-start gap-3">

              <div className="rounded-xl bg-slate-100 p-2.5">
                <Users className="h-5 w-5 text-slate-700" />
              </div>

              <div>

                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Guest Name
                </p>

                <p className="mt-1 font-medium text-slate-900">
                  {booking.guestName || "—"}
                </p>

              </div>

            </div>

            <div className="flex items-start gap-3">

              <div className="rounded-xl bg-slate-100 p-2.5">
                <Mail className="h-5 w-5 text-slate-700" />
              </div>

              <div>

                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Email
                </p>

                <p className="mt-1 break-all font-medium text-slate-900">
                  {booking.email || "—"}
                </p>

              </div>

            </div>

            <div className="flex items-start gap-3">

              <div className="rounded-xl bg-slate-100 p-2.5">
                <Phone className="h-5 w-5 text-slate-700" />
              </div>

              <div>

                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Phone
                </p>

                <p className="mt-1 font-medium text-slate-900">
                  {booking.phone || "—"}
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* IMPORTANT NOTICE */}

        <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">

          <p className="text-sm leading-6 text-amber-800">
            This page is for viewing your booking information.
            Payment and booking management are available through
            your customer account.
          </p>

        </section>

      </div>

    </main>
  )
}