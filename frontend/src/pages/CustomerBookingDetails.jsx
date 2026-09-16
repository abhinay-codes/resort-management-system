import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import PaymentCard from "@/components/Payment/PaymentCard"
import {
  getMyBooking,
  cancelMyBooking,
} from "@/services/customerBookingService"

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
        setError(
          err?.message ||
          "Failed to load booking."
        )
      } finally {
        setLoading(false)
      }
    }

    loadBooking()
  }, [id])

  async function handleCancelBooking() {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    )

    if (!confirmed) {
      return
    }

    try {
      setCancelling(true)
      setError("")

      const updatedBooking =
        await cancelMyBooking(id)

      setBooking(updatedBooking)
    } catch (err) {
      setError(
        err?.message ||
        "Failed to cancel booking."
      )
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading booking...</p>
      </div>
    )
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {error}
          </p>

          <button
            type="button"
            onClick={() => navigate("/customer")}
            className="px-4 py-2 rounded-md border"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!booking) {
    return null
  }

  const canCancel =
    booking.status === "PENDING" ||
    booking.status === "CONFIRMED"

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-4xl mx-auto">

        <div className="flex items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Booking #{booking.id}
            </h1>

            <p className="text-gray-500 mt-1">
              Booking details
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/customer")}
            className="px-4 py-2 rounded-md border"
          >
            Back
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-red-300 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">

          <section className="rounded-xl border p-6">
            <h2 className="text-xl font-semibold mb-4">
              Booking Information
            </h2>

            <div className="space-y-3">
              <div>
                <span className="font-medium">
                  Status:
                </span>{" "}
                {booking.status}
              </div>

              <div>
                <span className="font-medium">
                  Check-in:
                </span>{" "}
                {booking.checkIn}
              </div>

              <div>
                <span className="font-medium">
                  Check-out:
                </span>{" "}
                {booking.checkOut}
              </div>

              <div>
                <span className="font-medium">
                  Guests:
                </span>{" "}
                {booking.guests}
              </div>

              <div>
                <span className="font-medium">
                  Total:
                </span>{" "}
                ₹{booking.totalAmount}
              </div>
            </div>
          </section>

          <section className="rounded-xl border p-6">
            <h2 className="text-xl font-semibold mb-4">
              Guest Information
            </h2>

            <div className="space-y-3">
              <div>
                <span className="font-medium">
                  Name:
                </span>{" "}
                {booking.guestName}
              </div>

              <div>
                <span className="font-medium">
                  Email:
                </span>{" "}
                {booking.email}
              </div>

              {booking.phone && (
                <div>
                  <span className="font-medium">
                    Phone:
                  </span>{" "}
                  {booking.phone}
                </div>
              )}

              {booking.specialRequest && (
                <div>
                  <span className="font-medium">
                    Special Request:
                  </span>{" "}
                  {booking.specialRequest}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-xl border p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">
              Room
            </h2>

            <div className="space-y-3">
              <div className="text-xl font-semibold">
                {booking.room?.name ||
                  `Room #${booking.room?.id ?? "—"}`}
              </div>

              {booking.room?.description && (
                <p className="text-gray-600">
                  {booking.room.description}
                </p>
              )}
            </div>
          </section>

          {canCancel && (
            <section className="rounded-xl border border-red-200 p-6 md:col-span-2">
              <h2 className="text-xl font-semibold mb-2">
                Cancel Booking
              </h2>

              <p className="text-gray-600 mb-4">
                You can cancel a pending or confirmed
                booking.
              </p>

              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancelBooking}
                className="px-4 py-2 rounded-md border border-red-500 text-red-600 disabled:opacity-50"
              >
                {cancelling
                  ? "Cancelling..."
                  : "Cancel Booking"}
              </button>
            </section>
          )}

          <section className="md:col-span-2">
            <PaymentCard
              bookingId={booking.id}
              bookingStatus={booking.status}
            />
          </section>

        </div>
      </div>
    </div>
  )
}