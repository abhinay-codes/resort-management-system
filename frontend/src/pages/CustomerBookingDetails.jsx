import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Check, Calendar, Users, Home } from "lucide-react"

import PaymentCard from "@/components/Payment/PaymentCard"
import { getMyBooking, cancelMyBooking } from "@/services/customerBookingService"
import { formatCurrency } from "@/utils/currency"

function formatDate(dateStr) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
}

export default function CustomerBookingDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadBooking() {
      try {
        setLoading(true)
        setError("")
        const data = await getMyBooking(id)
        setBooking(data)
      } catch (err) {
        setError(err?.message || "Failed to load booking.")
      } finally {
        setLoading(false)
      }
    }
    loadBooking()
  }, [id])

  async function handleCancelBooking() {
    const confirmed = window.confirm("Are you sure you want to cancel this booking? This action cannot be undone.")
    if (!confirmed) return

    try {
      setCancelling(true)
      setError("")
      const updatedBooking = await cancelMyBooking(id)
      setBooking(updatedBooking)
    } catch (err) {
      setError(err?.message || "Failed to cancel booking.")
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background pt-24 pb-32">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center text-muted-foreground font-light">
          Loading booking details...
        </div>
      </main>
    )
  }

  if (error && !booking) {
    return (
      <main className="min-h-screen bg-background pt-24 pb-32">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <p className="text-destructive font-medium mb-8">{error}</p>
          <button
            type="button"
            onClick={() => navigate("/customer")}
            className="px-6 py-3 border border-border uppercase tracking-widest text-xs font-semibold hover:bg-muted transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    )
  }

  if (!booking) return null

  const canCancel = booking.status === "PENDING" || booking.status === "CONFIRMED"

  return (
    <main className="min-h-screen bg-background pt-24 pb-32">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">

        <button
          onClick={() => navigate("/customer")}
          className="group flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-12"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Dashboard
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 pb-8 border-b border-border/50">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Reservation #{booking.id}</p>
            <h1 className="text-4xl font-medium tracking-tight">Your Stay</h1>
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

        {error && (
          <div className="mb-8 p-4 bg-destructive/5 border border-destructive/20 text-destructive text-sm rounded-sm">
            {error}
          </div>
        )}

        <div className="grid gap-12 lg:grid-cols-[1fr_400px]">

          <div className="space-y-12">

            <section>
              <h2 className="text-lg font-medium mb-6">Reservation Details</h2>
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
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Dates</p>
                    <p className="font-medium">{formatDate(booking.checkIn)} &mdash; {formatDate(booking.checkOut)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 pb-6 border-b border-border/50">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Guests</p>
                    <p className="font-medium">{booking.guests} Guests</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-medium">Total Amount</span>
                  <span className="text-2xl font-medium tracking-tight">{formatCurrency(booking.totalAmount)}</span>
                </div>

              </div>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-6">Guest Information</h2>
              <div className="border border-border/60 bg-card rounded-sm p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Name</p>
                  <p className="font-medium">{booking.guestName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Email</p>
                  <p className="font-medium break-all">{booking.email}</p>
                </div>
                {booking.phone && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Phone</p>
                    <p className="font-medium">{booking.phone}</p>
                  </div>
                )}
              </div>
              {booking.specialRequest && (
                <div className="mt-6 border border-border/60 bg-card rounded-sm p-6 sm:p-8">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Special Request</p>
                  <p className="text-muted-foreground font-light">{booking.specialRequest}</p>
                </div>
              )}
            </section>

            {canCancel && (
              <section className="pt-8 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-medium">Cancel Reservation</h2>
                    <p className="text-sm text-muted-foreground font-light mt-1">This action cannot be undone.</p>
                  </div>
                  <button
                    onClick={handleCancelBooking}
                    disabled={cancelling}
                    className="px-6 py-3 bg-destructive/10 text-destructive border border-destructive/20 uppercase tracking-widest text-xs font-semibold rounded-sm hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    {cancelling ? "Cancelling..." : "Cancel"}
                  </button>
                </div>
              </section>
            )}
          </div>

          <div className="space-y-12">
            <PaymentCard bookingId={booking.id} bookingStatus={booking.status} />
          </div>

        </div>
      </div>
    </main>
  )
}
