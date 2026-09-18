import { useEffect, useState } from "react"
import { CheckCircle2, Clock, CreditCard, Loader2, RefreshCw, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  createPayment,
  getPaymentByBooking,
  processTestPayment,
  retryPayment,
} from "@/services/payment/paymentService"
import { formatCurrency } from "@/utils/currency"

function formatDate(date) {
  if (!date) return "—"
  return new Date(date).toLocaleString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function PaymentCard({ bookingId, bookingStatus }) {
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")

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
        const data = await getPaymentByBooking(bookingId)
        if (mounted) setPayment(data)
      } catch (err) {
        console.error("Failed to load payment:", err)
        if (mounted) setError(err?.message || "Unable to load payment information.")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadPayment()
    return () => { mounted = false }
  }, [bookingId])

  async function handleCreatePayment() {
    if (processing || bookingStatus === "CANCELLED") return
    try {
      setProcessing(true)
      setError("")
      const data = await createPayment(bookingId)
      setPayment(data)
    } catch (err) {
      setError(err?.message || "Unable to start payment.")
    } finally {
      setProcessing(false)
    }
  }

  async function handlePayNow() {
    if (!payment?.id || processing || bookingStatus === "CANCELLED") return
    try {
      setProcessing(true)
      setError("")
      const data = await processTestPayment(payment.id, true)
      setPayment(data)
    } catch (err) {
      setError(err?.message || "Unable to process payment.")
    } finally {
      setProcessing(false)
    }
  }

  async function handleRetry() {
    if (!payment?.id || processing || bookingStatus === "CANCELLED") return
    try {
      setProcessing(true)
      setError("")
      const data = await retryPayment(payment.id)
      setPayment(data)
    } catch (err) {
      setError(err?.message || "Unable to retry payment.")
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="border border-border/60 bg-card rounded-sm p-8 shadow-sm flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error && !payment) {
    return (
      <div className="border border-destructive/20 bg-destructive/5 rounded-sm p-8">
        <h2 className="text-lg font-medium text-destructive mb-2">Payment Unavailable</h2>
        <p className="text-sm text-destructive/80">{error}</p>
      </div>
    )
  }

  if (!payment) {
    if (bookingStatus === "CANCELLED") {
      return (
        <div className="border border-border/60 bg-muted/30 rounded-sm p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Booking Cancelled</p>
          <h2 className="text-xl font-medium mb-2">No payment required</h2>
          <p className="text-sm text-muted-foreground font-light">This booking has been cancelled, so payment cannot be started.</p>
        </div>
      )
    }

    return (
      <div className="border border-border/60 bg-card rounded-sm p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Action Required</p>
            <h2 className="text-2xl font-medium mb-1">Complete your payment</h2>
            <p className="text-muted-foreground font-light text-sm">Your reservation is waiting for payment.</p>
          </div>
          <Button onClick={handleCreatePayment} disabled={processing} className="rounded-sm uppercase text-xs tracking-widest font-semibold px-6 py-6">
            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
            Start Payment
          </Button>
        </div>
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      </div>
    )
  }

  if (bookingStatus === "CANCELLED") {
    return (
      <div className="border border-border/60 bg-muted/30 rounded-sm p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Booking Cancelled</p>
        <h2 className="text-xl font-medium mb-4">Payment actions unavailable</h2>
        <p className="text-sm text-muted-foreground font-light mb-4">This booking has been cancelled.</p>

        {payment.status === "REFUNDED" && <p className="text-sm text-primary">Payment has been refunded.</p>}
        {payment.status === "PENDING" && <p className="text-sm text-muted-foreground">The existing payment is pending, but cannot be completed.</p>}
        {payment.status === "FAILED" && <p className="text-sm text-muted-foreground">The previous payment failed.</p>}
      </div>
    )
  }

  if (payment.status === "SUCCESS") {
    return (
      <div className="border border-border/60 bg-card rounded-sm p-8 shadow-sm">
        <div className="flex items-start gap-4 mb-8">
          <CheckCircle2 className="h-6 w-6 text-primary mt-1" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">Payment Successful</p>
            <h2 className="text-2xl font-medium">Your payment is complete</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-border/50">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Amount Paid</p>
            <p className="font-medium text-lg">{formatCurrency(payment.amount)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Reference</p>
            <p className="font-medium text-sm break-all">{payment.paymentReference || "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Date</p>
            <p className="font-medium text-sm">{formatDate(payment.updatedAt)}</p>
          </div>
        </div>
      </div>
    )
  }

  if (payment.status === "REFUNDED") {
    return (
      <div className="border border-border/60 bg-muted/30 rounded-sm p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Refunded</p>
        <h2 className="text-xl font-medium mb-2">This payment has been refunded</h2>
        <p className="text-sm text-muted-foreground font-light">Amount: <span className="font-medium">{formatCurrency(payment.amount)}</span></p>
      </div>
    )
  }

  if (payment.status === "FAILED") {
    return (
      <div className="border border-destructive/20 bg-destructive/5 rounded-sm p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-destructive mb-2">Payment Failed</p>
            <h2 className="text-xl font-medium mb-1">Your payment was unsuccessful</h2>
            <p className="text-sm text-destructive/80 font-light">You can try again to confirm your booking.</p>
          </div>
          <Button onClick={handleRetry} disabled={processing} variant="destructive" className="rounded-sm uppercase text-xs tracking-widest font-semibold px-6 py-6">
            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Retry Payment
          </Button>
        </div>
        {error && <p className="mt-4 text-sm font-medium">{error}</p>}
      </div>
    )
  }

  return (
    <div className="border border-border/60 bg-card rounded-sm p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between gap-6 mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Payment Pending</p>
          <h2 className="text-2xl font-medium">Complete payment to confirm</h2>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Amount Due</p>
          <p className="text-3xl font-medium tracking-tight">{formatCurrency(payment.amount)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-border/50 mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Reference</p>
          <p className="text-sm font-medium break-all">{payment.paymentReference || "—"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Method</p>
          <p className="text-sm font-medium">{payment.paymentMethod || "Online Payment"}</p>
        </div>
      </div>

      {error && <p className="mb-6 text-sm text-destructive">{error}</p>}

      <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-border/50 gap-4">
        <p className="text-sm text-muted-foreground italic">
          This is a college demo. No real transactions are processed.
        </p>
        <Button onClick={handlePayNow} disabled={processing} className="rounded-sm uppercase text-xs tracking-widest font-semibold px-8 py-6 w-full sm:w-auto">
          {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
          Simulate Demo Payment
        </Button>
      </div>
    </div>
  )
}

export default PaymentCard
