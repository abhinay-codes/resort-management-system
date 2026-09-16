import { useEffect, useState } from "react"
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Mail,
  Phone,
  UserRound,
  Users,
} from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"

import { getRole } from "@/services/authService"

import {
  getBookingById,
  updateBookingStatus,
} from "@/services/bookingService"

import {
  getEmployeeBookingById,
  updateEmployeeBookingStatus,
} from "@/services/employeeBookingService"

import {
  checkInBooking,
  employeeCheckInBooking,
} from "@/services/operations/checkInService"

import {
  checkOutBooking,
  employeeCheckOutBooking,
} from "@/services/operations/checkOutService"

function formatPrice(value) {
  return Number(value).toLocaleString("en-IN")
}

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
    month: "short",
    year: "numeric",
  })
}

function getStatusClasses(status) {
  switch (status) {
    case "CONFIRMED":
      return "bg-primary/10 text-primary border-primary/20"

    case "CHECKED_IN":
      return "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-300"

    case "CHECKED_OUT":
      return "bg-muted text-muted-foreground border-border"

    case "CANCELLED":
      return "bg-destructive/10 text-destructive border-destructive/20"

    case "PENDING":
    default:
      return "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-300"
  }
}

function BookingDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const role = getRole()

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updating, setUpdating] = useState(false)

  async function loadBooking() {
    try {
      setLoading(true)
      setError("")

      let data

      if (role === "ADMIN") {
        data = await getBookingById(id)
      } else if (role === "EMPLOYEE") {
        data = await getEmployeeBookingById(id)
      } else {
        throw new Error(
          "You are not authorized to view this booking."
        )
      }

      setBooking(data)
    } catch (error) {
      console.error(
        "Failed to load booking:",
        error
      )

      setError(
        error.message ||
          "Unable to load this booking."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBooking()
  }, [id, role])

  async function handleStatusChange(newStatus) {
    try {
      setUpdating(true)
      setError("")

      let updatedBooking

      if (newStatus === "CHECKED_IN") {
        updatedBooking =
          role === "ADMIN"
            ? await checkInBooking(id)
            : await employeeCheckInBooking(id)
      } else if (newStatus === "CHECKED_OUT") {
        updatedBooking =
          role === "ADMIN"
            ? await checkOutBooking(id)
            : await employeeCheckOutBooking(id)
      } else if (role === "ADMIN") {
        updatedBooking = await updateBookingStatus(
          id,
          newStatus
        )
      } else {
        updatedBooking =
          await updateEmployeeBookingStatus(
            id,
            newStatus
          )
      }

      setBooking(updatedBooking)
    } catch (error) {
      console.error(
        "Failed to update booking:",
        error
      )

      setError(
        error.message ||
          "Unable to update booking status."
      )
    } finally {
      setUpdating(false)
    }
  }

  /*
   * LOADING
   */
  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="page-container py-10 sm:py-16">
          <div className="animate-pulse space-y-6">
            <div className="h-5 w-32 rounded bg-muted" />
            <div className="h-12 w-64 rounded bg-muted" />

            <div className="rounded-3xl border border-border/60 bg-card p-6">
              <div className="h-7 w-40 rounded bg-muted" />
              <div className="mt-5 h-16 rounded-2xl bg-muted" />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="h-72 rounded-3xl bg-muted" />
              <div className="h-72 rounded-3xl bg-muted" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  /*
   * ERROR
   */
  if (error) {
    return (
      <main className="min-h-screen bg-background">
        <div className="page-container py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <CalendarDays className="size-7" />
            </div>

            <h1 className="mt-6 text-2xl font-semibold sm:text-3xl">
              Unable to load booking
            </h1>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {error}
            </p>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-background px-5 text-sm font-semibold transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <ArrowLeft className="size-4" />
              Go Back
            </button>
          </div>
        </div>
      </main>
    )
  }

  if (!booking) {
    return null
  }

  const checkIn = new Date(booking.checkIn)
  const checkOut = new Date(booking.checkOut)

  const nights = Math.max(
    0,
    Math.round(
      (checkOut - checkIn) /
        (1000 * 60 * 60 * 24)
    )
  )

  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <div className="page-container py-8 sm:py-12 lg:py-16">
        {/* HEADER */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="group mb-5 inline-flex min-h-9 items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
              Back
            </button>

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Booking #{booking.id}
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Booking Details
            </h1>
          </div>
        </div>

        {/* STATUS */}
        <section className="mt-7 overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm">
          <div className="p-5 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <CheckCircle2 className="size-4" />
                  Reservation Status
                </div>

                <p className="mt-3 text-2xl font-bold">
                  {booking.status}
                </p>
              </div>

              <span
                className={`w-fit rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide ${getStatusClasses(
                  booking.status
                )}`}
              >
                {booking.status}
              </span>
            </div>

            {/* ACTIONS */}
            <div className="mt-6 border-t border-border/60 pt-5">
              <div className="flex flex-wrap gap-3">
                {booking.status === "PENDING" && (
                  <>
                    <button
                      type="button"
                      disabled={updating}
                      onClick={() =>
                        handleStatusChange(
                          "CONFIRMED"
                        )
                      }
                      className="min-h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Confirm Booking
                    </button>

                    <button
                      type="button"
                      disabled={updating}
                      onClick={() =>
                        handleStatusChange(
                          "CANCELLED"
                        )
                      }
                      className="min-h-11 rounded-xl border border-destructive/20 bg-destructive/5 px-5 text-sm font-semibold text-destructive transition hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </>
                )}

                {booking.status === "CONFIRMED" && (
                  <>
                    <button
                      type="button"
                      disabled={updating}
                      onClick={() =>
                        handleStatusChange(
                          "CHECKED_IN"
                        )
                      }
                      className="min-h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Check In
                    </button>

                    <button
                      type="button"
                      disabled={updating}
                      onClick={() =>
                        handleStatusChange(
                          "CANCELLED"
                        )
                      }
                      className="min-h-11 rounded-xl border border-destructive/20 bg-destructive/5 px-5 text-sm font-semibold text-destructive transition hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </>
                )}

                {booking.status === "CHECKED_IN" && (
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() =>
                      handleStatusChange(
                        "CHECKED_OUT"
                      )
                    }
                    className="min-h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Check Out
                  </button>
                )}

                {(booking.status === "CANCELLED" ||
                  booking.status === "CHECKED_OUT") && (
                  <span className="inline-flex min-h-11 items-center rounded-xl bg-muted px-5 text-sm font-medium text-muted-foreground">
                    No further actions
                  </span>
                )}
              </div>

              {updating && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Updating booking status...
                </p>
              )}
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-5 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* INFORMATION GRID */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* GUEST */}
          <section className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <UserRound className="size-5" />
              </div>

              <div>
                <h2 className="text-lg font-semibold">
                  Guest Information
                </h2>

                <p className="text-xs text-muted-foreground">
                  Reservation guest details
                </p>
              </div>
            </div>

            <div className="mt-7 space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Guest Name
                </p>

                <p className="mt-2 break-words font-medium">
                  {booking.guestName}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 text-muted-foreground" />

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Email
                  </p>

                  <p className="mt-2 break-all text-sm font-medium">
                    {booking.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 size-4 text-muted-foreground" />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Phone
                  </p>

                  <p className="mt-2 text-sm font-medium">
                    {booking.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="mt-0.5 size-4 text-muted-foreground" />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Guests
                  </p>

                  <p className="mt-2 text-sm font-medium">
                    {booking.guests}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ROOM */}
          <section className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CalendarDays className="size-5" />
              </div>

              <div>
                <h2 className="text-lg font-semibold">
                  Room Information
                </h2>

                <p className="text-xs text-muted-foreground">
                  Accommodation details
                </p>
              </div>
            </div>

            <div className="mt-7 space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Room
                </p>

                <p className="mt-2 font-medium">
                  {booking.room?.name}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Price Per Night
                </p>

                <p className="mt-2 font-medium">
                  ₹{formatPrice(booking.room?.price)}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Room Capacity
                </p>

                <p className="mt-2 font-medium">
                  {booking.room?.guests} guests
                </p>
              </div>
            </div>
          </section>

          {/* STAY */}
          <section className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Clock3 className="size-5" />
              </div>

              <div>
                <h2 className="text-lg font-semibold">
                  Stay Information
                </h2>

                <p className="text-xs text-muted-foreground">
                  Dates and duration
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl bg-muted/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Check-in
                </p>

                <p className="mt-2 font-medium">
                  {formatDate(booking.checkIn)}
                </p>
              </div>

              <div className="rounded-2xl bg-muted/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Check-out
                </p>

                <p className="mt-2 font-medium">
                  {formatDate(booking.checkOut)}
                </p>
              </div>

              <div className="rounded-2xl bg-muted/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Nights
                </p>

                <p className="mt-2 font-medium">
                  {nights}
                </p>
              </div>

              <div className="rounded-2xl bg-muted/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Guests
                </p>

                <p className="mt-2 font-medium">
                  {booking.guests}
                </p>
              </div>
            </div>
          </section>

          {/* SUMMARY */}
          <section className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CheckCircle2 className="size-5" />
              </div>

              <div>
                <h2 className="text-lg font-semibold">
                  Booking Summary
                </h2>

                <p className="text-xs text-muted-foreground">
                  Reservation total and requests
                </p>
              </div>
            </div>

            <div className="mt-7">
              <div className="rounded-2xl bg-foreground p-5 text-background">
                <p className="text-xs font-semibold uppercase tracking-wide text-background/60">
                  Total Amount
                </p>

                <p className="mt-2 text-3xl font-bold">
                  ₹{formatPrice(booking.totalAmount)}
                </p>
              </div>

              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Special Request
                </p>

                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
                  {booking.specialRequest ||
                    "No special request."}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

export default BookingDetails