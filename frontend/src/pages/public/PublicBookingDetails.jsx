import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, Calendar, Home, Loader2, Mail, Phone, Users } from "lucide-react"

import { getBookingById } from "@/services/bookingService"

function formatDate(dateStr) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
}

import { formatCurrency } from "@/utils/currency"

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
        setError(err?.message || "Unable to find this booking.")
      } finally {
        setLoading(false)
      }
    }
    if (id) loadBooking()
  }, [id])

  if (loading) {
    return (
      <main className="min-h-screen bg-background pt-32 pb-32">
        <div className="flex justify-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </main>
    )
  }

  if (error || !booking) {
    return (
      <main className="min-h-screen bg-background pt-32 pb-32">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-medium mb-4">Booking Not Found</h1>
          <p className="text-muted-foreground font-light mb-8">{error}</p>
          <Link to="/booking-lookup" className="inline-flex items-center justify-center px-6 py-3 border border-border uppercase tracking-widest text-xs font-semibold hover:bg-muted transition-colors">
            Search Again
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background pt-24 pb-32">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">

        <Link to="/booking-lookup" className="group flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-12">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Lookup Another Booking
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 pb-8 border-b border-border/50">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Reservation #{booking.id}</p>
            <h1 className="text-4xl font-medium tracking-tight">Booking Details</h1>
          </div>
          <div>
            <span className={`inline-block px-4 py-1.5 text-xs font-semibold uppercase tracking-widest border rounded-sm ${
              booking.status === "CONFIRMED" ? "bg-primary/5 border-primary text-primary" :
              booking.status === "CANCELLED" ? "bg-destructive/5 border-destructive text-destructive" :
              "bg-muted/50 border-border text-foreground"
            }`}>
              {booking.status}
            </span>
          </div>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1fr_0.7fr]">
          <section>
            <h2 className="text-lg font-medium mb-6">Reservation</h2>
            <div className="border border-border/60 bg-card rounded-sm p-6 sm:p-8 space-y-6">

              <div className="flex items-start gap-4 pb-6 border-b border-border/50">
                <Home className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Room</p>
                  <p className="font-medium text-lg">{booking.room?.name || `Room #${booking.room?.id ?? "—"}`}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 pb-6 border-b border-border/50">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Stay</p>
                  <p className="font-medium">{formatDate(booking.checkIn)} &mdash; {formatDate(booking.checkOut)}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Guests</p>
                  <p className="font-medium">{booking.guests ?? "—"}</p>
                </div>
              </div>

            </div>
          </section>

          <section>
            <div className="border border-border/60 bg-card rounded-sm p-6 sm:p-8 sticky top-32">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Total Amount</p>
              <p className="text-4xl font-medium tracking-tight mb-8">{formatCurrency(booking.totalAmount)}</p>

              <div className="pt-6 border-t border-border/50 mb-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Status</p>
                <p className="font-medium">{booking.status}</p>
              </div>

              <div className="bg-muted/30 border border-border/60 p-4 rounded-sm">
                <p className="text-xs font-light text-muted-foreground leading-relaxed">
                  Payment and booking management are available through your customer account.
                </p>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-12">
          <h2 className="text-lg font-medium mb-6">Guest Information</h2>
          <div className="border border-border/60 bg-card rounded-sm p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex gap-4">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Guest Name</p>
                <p className="font-medium">{booking.guestName || "—"}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Email</p>
                <p className="font-medium break-all">{booking.email || "—"}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Phone</p>
                <p className="font-medium">{booking.phone || "—"}</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  )
}
