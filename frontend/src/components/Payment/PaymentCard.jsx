import { useEffect, useState } from "react"

import {
  CheckCircle2,
  Clock3,
  CreditCard,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"

import {
  createPayment,
  getPaymentByBooking,
  processTestPayment,
  retryPayment,
} from "@/services/payment/paymentService"

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

function formatDate(date) {
  if (!date) {
    return "—"
  }

  return new Date(date).toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  )
}

function PaymentCard({ bookingId, bookingStatus }) {
  const [payment, setPayment] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [processing, setProcessing] =
    useState(false)

  const [error, setError] =
    useState("")

  /*
   * ==========================================
   * LOAD PAYMENT
   * ==========================================
   */
  useEffect(() => {
    let mounted = true

    async function loadPayment() {
      if (!bookingId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError("")

        const data =
          await getPaymentByBooking(
            bookingId
          )

        if (mounted) {
          setPayment(data)
        }
      } catch (err) {
        console.error(
          "Failed to load payment:",
          err
        )

        if (mounted) {
          setError(
            err?.message ||
              "Unable to load payment information."
          )
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadPayment()

    return () => {
      mounted = false
    }
  }, [bookingId])

  /*
   * ==========================================
   * CREATE PAYMENT
   * ==========================================
   *
   * Normally the backend already creates the
   * payment with the booking.
   *
   * This remains as a safe fallback because
   * createPayment() is idempotent.
   */
  async function handleCreatePayment() {
    if (processing || bookingStatus === "CANCELLED") {
      return
    }

    try {
      setProcessing(true)
      setError("")

      const data =
        await createPayment(
          bookingId
        )

      setPayment(data)
    } catch (err) {
      console.error(
        "Failed to create payment:",
        err
      )

      setError(
        err?.message ||
          "Unable to start payment."
      )
    } finally {
      setProcessing(false)
    }
  }

  /*
   * ==========================================
   * TEST PAYMENT
   * ==========================================
   *
   * Development payment simulation.
   *
   * true:
   * PENDING -> SUCCESS
   *
   * The backend then confirms the booking.
   */
  async function handlePayNow() {
    if (
      !payment?.id ||
      processing ||
      bookingStatus === "CANCELLED"
    ) {
      return
    }

    try {
      setProcessing(true)
      setError("")

      const data =
        await processTestPayment(
          payment.id,
          true
        )

      setPayment(data)
    } catch (err) {
      console.error(
        "Failed to process payment:",
        err
      )

      setError(
        err?.message ||
          "Unable to process payment."
      )
    } finally {
      setProcessing(false)
    }
  }

  /*
   * ==========================================
   * RETRY PAYMENT
   * ==========================================
   */
  async function handleRetry() {
    if (
      !payment?.id ||
      processing ||
      bookingStatus === "CANCELLED"
    ) {
      return
    }

    try {
      setProcessing(true)
      setError("")

      const data =
        await retryPayment(
          payment.id
        )

      setPayment(data)
    } catch (err) {
      console.error(
        "Failed to retry payment:",
        err
      )

      setError(
        err?.message ||
          "Unable to retry payment."
      )
    } finally {
      setProcessing(false)
    }
  }

  /*
   * ==========================================
   * LOADING
   * ==========================================
   */
  if (loading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-slate-500" />

          <p className="text-sm text-slate-600">
            Loading payment information...
          </p>
        </div>
      </section>
    )
  }

  /*
   * ==========================================
   * ERROR WITHOUT PAYMENT
   * ==========================================
   */
  if (error && !payment) {
    return (
      <section className="rounded-3xl border border-red-200 bg-white p-6 shadow-sm">
        <div className="flex gap-4">
          <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-500" />

          <div>
            <h2 className="font-semibold text-slate-900">
              Payment unavailable
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              {error}
            </p>
          </div>
        </div>
      </section>
    )
  }

  /*
   * ==========================================
   * NO PAYMENT
   * ==========================================
   */
  if (!payment) {
    if (bookingStatus === "CANCELLED") {
      return (
        <section className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100">
              <XCircle className="h-6 w-6 text-slate-600" />
            </div>

            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                Booking Cancelled
              </p>

              <h2 className="mt-1 text-xl font-semibold text-slate-900">
                No payment is required
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                This booking has been cancelled, so payment cannot be started.
              </p>
            </div>
          </div>
        </section>
      )
    }

    return (
      <section className="rounded-3xl border border-amber-200 bg-white p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50">
              <CreditCard className="h-6 w-6 text-amber-600" />
            </div>

            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-amber-600">
                Payment Required
              </p>

              <h2 className="mt-1 text-xl font-semibold text-slate-900">
                Complete your payment
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Your booking is waiting for payment.
              </p>
            </div>
          </div>

          <Button
            onClick={handleCreatePayment}
            disabled={processing}
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Start Payment
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </section>
    )
  }

  /*
   * ==========================================
   * CANCELLED BOOKING
   * ==========================================
   *
   * A cancelled booking must never expose
   * payment or retry actions.
   */
  if (bookingStatus === "CANCELLED") {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100">
            <XCircle className="h-6 w-6 text-slate-600" />
          </div>

          <div className="flex-1">
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Booking Cancelled
            </p>

            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              Payment actions are unavailable
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              This booking has been cancelled. No further payment or retry action can be performed.
            </p>

            {payment.status === "REFUNDED" && (
              <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                The payment has been refunded.
              </div>
            )}

            {payment.status === "PENDING" && (
              <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                The existing payment record is still pending, but it cannot be used to confirm this cancelled booking.
              </div>
            )}

            {payment.status === "FAILED" && (
              <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                The previous payment failed and cannot be retried for this cancelled booking.
              </div>
            )}
          </div>
        </div>
      </section>
    )
  }

  /*
   * ==========================================
   * SUCCESS
   * ==========================================
   */
  if (payment.status === "SUCCESS") {
    return (
      <section className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm">

        <div className="flex gap-4">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>

          <div className="flex-1">

            <div className="flex flex-wrap items-center justify-between gap-3">

              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-emerald-600">
                  Payment Successful
                </p>

                <h2 className="mt-1 text-xl font-semibold text-slate-900">
                  Your payment is complete
                </h2>
              </div>

              <p className="text-xl font-semibold text-slate-900">
                {formatCurrency(
                  payment.amount
                )}
              </p>

            </div>

            <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Payment Reference
                </p>

                <p className="mt-1 break-all text-sm font-medium text-slate-800">
                  {payment.paymentReference ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Paid On
                </p>

                <p className="mt-1 text-sm font-medium text-slate-800">
                  {formatDate(
                    payment.updatedAt
                  )}
                </p>
              </div>

            </div>

            <div className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Your booking has been confirmed.
            </div>

          </div>
        </div>
      </section>
    )
  }

  /*
   * ==========================================
   * REFUNDED
   * ==========================================
   */
  if (payment.status === "REFUNDED") {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex gap-4">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100">
            <RefreshCw className="h-6 w-6 text-slate-600" />
          </div>

          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Payment Refunded
            </p>

            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              This payment has been refunded
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Amount:{" "}
              <span className="font-medium">
                {formatCurrency(
                  payment.amount
                )}
              </span>
            </p>
          </div>

        </div>
      </section>
    )
  }

  /*
   * ==========================================
   * FAILED
   * ==========================================
   */
  if (payment.status === "FAILED") {
    return (
      <section className="rounded-3xl border border-red-200 bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>

            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-red-600">
                Payment Failed
              </p>

              <h2 className="mt-1 text-xl font-semibold text-slate-900">
                Your payment was unsuccessful
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                You can retry the payment.
              </p>
            </div>

          </div>

          <Button
            onClick={handleRetry}
            disabled={processing}
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry Payment
              </>
            )}
          </Button>

        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

      </section>
    )
  }

  /*
   * ==========================================
   * PENDING
   * ==========================================
   */
  return (
    <section className="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">

      <div className="flex flex-col gap-5">

        <div className="flex gap-4">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50">
            <Clock3 className="h-6 w-6 text-amber-600" />
          </div>

          <div className="flex-1">

            <div className="flex flex-wrap items-center justify-between gap-3">

              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-amber-600">
                  Payment Pending
                </p>

                <h2 className="mt-1 text-xl font-semibold text-slate-900">
                  Complete payment to confirm your booking
                </h2>
              </div>

              <p className="text-xl font-semibold text-slate-900">
                {formatCurrency(
                  payment.amount
                )}
              </p>

            </div>

            <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Payment Reference
                </p>

                <p className="mt-1 break-all text-sm font-medium text-slate-800">
                  {payment.paymentReference ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Payment Method
                </p>

                <p className="mt-1 text-sm font-medium text-slate-800">
                  {payment.paymentMethod ||
                    "Online Payment"}
                </p>
              </div>

            </div>

          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end">

          <Button
            onClick={handlePayNow}
            disabled={processing}
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pay Now
              </>
            )}
          </Button>

        </div>

      </div>
    </section>
  )
}

export default PaymentCard