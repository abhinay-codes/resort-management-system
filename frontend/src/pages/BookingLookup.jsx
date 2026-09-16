import { useState } from "react"
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clipboard,
  Mail,
  Search,
  UserRound,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import { lookupCustomerBooking } from "@/services/bookingService"
import { Button } from "@/components/ui/button"

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

function BookingLookup() {
  const navigate = useNavigate()

  const [reference, setReference] = useState("")
  const [email, setEmail] = useState("")

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleLookup(event) {
    event.preventDefault()

    setError("")
    setBooking(null)

    if (!reference.trim()) {
      setError("Please enter your booking reference.")
      return
    }

    if (!/^\d+$/.test(reference.trim())) {
      setError(
        "Booking reference must contain only numbers."
      )
      return
    }

    if (!email.trim()) {
      setError("Please enter your email address.")
      return
    }

    try {
      setLoading(true)

      const data = await lookupCustomerBooking(
        reference.trim(),
        email.trim()
      )

      setBooking(data)
    } catch (error) {
      console.error(
        "Failed to lookup booking:",
        error
      )

      setError(
        error.message ||
          "Unable to find your booking."
      )
    } finally {
      setLoading(false)
    }
  }

  function handleSearchAgain() {
    setBooking(null)
    setReference("")
    setEmail("")
    setError("")
  }

  return (
    <main className="min-h-screen overflow-hidden bg-background">
      {/* HEADER */}
      <section className="border-b border-border/60 bg-muted/30">
        <div className="page-container py-14 sm:py-18 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Clipboard className="size-3.5" />
              Manage Your Stay
            </div>

            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Find your
              <span className="text-primary">
                {" "}booking.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Enter your booking reference and email address
              to view your reservation.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="page-container">
          <div className="mx-auto max-w-3xl">
            {/* SEARCH FORM */}
            <form
              onSubmit={handleLookup}
              className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm sm:p-8"
            >
              <div className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Search className="size-5" />
                </div>

                <div>
                  <h2 className="text-xl font-semibold">
                    Look up your reservation
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Use the reference number you received when
                    your booking was submitted.
                  </p>
                </div>
              </div>

              <div className="mt-7 space-y-5">
                {/* REFERENCE */}
                <div>
                  <label
                    htmlFor="reference"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Booking Reference
                  </label>

                  <div className="relative">
                    <Clipboard className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                    <input
                      id="reference"
                      type="text"
                      inputMode="numeric"
                      value={reference}
                      onChange={(event) =>
                        setReference(
                          event.target.value
                        )
                      }
                      placeholder="e.g. 123"
                      className="min-h-12 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </div>
                </div>

                {/* EMAIL */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="min-h-12 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mt-5 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm leading-6 text-destructive"
                >
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="mt-6 min-h-12 w-full rounded-xl text-base"
              >
                {loading ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
                    Finding Booking...
                  </>
                ) : (
                  <>
                    Find My Booking
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>

            {/* RESULT */}
            {booking && (
              <section className="mt-6 overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm">
                {/* RESULT HEADER */}
                <div className="bg-primary/5 p-5 sm:p-7">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                        <CheckCircle2 className="size-4" />
                        Reservation Found
                      </div>

                      <p className="mt-3 text-xs uppercase tracking-[0.15em] text-muted-foreground">
                        Booking Reference
                      </p>

                      <h2 className="mt-1 text-3xl font-bold tracking-tight">
                        #{booking.id}
                      </h2>
                    </div>

                    <span className="w-fit rounded-full bg-background px-4 py-2 text-xs font-bold uppercase tracking-wide shadow-sm">
                      {booking.status}
                    </span>
                  </div>
                </div>

                <div className="p-5 sm:p-7">
                  {/* INFO */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border/60 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <UserRound className="size-3.5" />
                        Guest
                      </div>

                      <p className="mt-3 break-words font-medium">
                        {booking.guestName}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border/60 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <Clipboard className="size-3.5" />
                        Room
                      </div>

                      <p className="mt-3 break-words font-medium">
                        {booking.room?.name}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border/60 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <CalendarDays className="size-3.5" />
                        Check-in
                      </div>

                      <p className="mt-3 font-medium">
                        {formatDate(booking.checkIn)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border/60 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <CalendarDays className="size-3.5" />
                        Check-out
                      </div>

                      <p className="mt-3 font-medium">
                        {formatDate(booking.checkOut)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border/60 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <UserRound className="size-3.5" />
                        Guests
                      </div>

                      <p className="mt-3 font-medium">
                        {booking.guests}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border/60 p-4">
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Total Amount
                      </div>

                      <p className="mt-3 text-lg font-bold">
                        ₹{formatPrice(booking.totalAmount)}
                      </p>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Button
                      onClick={() =>
                        navigate(
                          `/booking-details/${booking.id}`
                        )
                      }
                      className="min-h-12 w-full rounded-xl sm:w-auto"
                    >
                      View Full Details
                      <ArrowRight className="size-4" />
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleSearchAgain}
                      className="min-h-12 w-full rounded-xl sm:w-auto"
                    >
                      Search Again
                    </Button>
                  </div>
                </div>
              </section>
            )}

            {/* HELP */}
            {!booking && (
              <div className="mt-6 rounded-2xl border border-border/60 bg-muted/30 p-5 text-center">
                <p className="text-sm font-medium">
                  Can't find your booking?
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Make sure your booking reference and email
                  address match the information used during
                  reservation.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

export default BookingLookup