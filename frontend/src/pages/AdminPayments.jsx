import { useEffect, useMemo, useState } from "react"
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  Eye,
  Loader2,
  RefreshCcw,
  RotateCcw,
  TrendingUp,
  XCircle,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import {
  getAllPayments,
  getRevenue,
  refundPayment,
} from "@/services/adminPaymentService"
import { updateBookingStatus } from "@/services/bookingService"

import { PageHeader } from "@/components/ui/PageHeader"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { StatCard } from "@/components/ui/StatCard"
import { EmptyState } from "@/components/ui/EmptyState"
import { Button } from "@/components/ui/button"

function formatAmount(amount) {
  if (amount === null || amount === undefined) return "₹0.00"
  return `₹${Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatDate(value) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function PaymentStatusBadge({ status }) {
  const config = {
    SUCCESS: {
      label: "Success",
      icon: CheckCircle2,
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    FAILED: {
      label: "Failed",
      icon: XCircle,
      className: "border-red-200 bg-red-50 text-red-700",
    },
    PENDING: {
      label: "Pending",
      icon: Clock3,
      className: "border-blue-200 bg-blue-50 text-blue-700",
    },
    REFUNDED: {
      label: "Refunded",
      icon: RotateCcw,
      className: "border-amber-200 bg-amber-50 text-amber-700",
    },
  }

  const current = config[status] || config.PENDING
  const Icon = current.icon

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${current.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {current.label}
    </span>
  )
}

export default function AdminPayments() {
  const navigate = useNavigate()

  const [payments, setPayments] = useState([])
  const [revenue, setRevenue] = useState(0)

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [refundingId, setRefundingId] = useState(null)
  const [cancellingBookingId, setCancellingBookingId] = useState(null)

  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  async function loadData(showRefreshState = false) {
    try {
      if (showRefreshState) setRefreshing(true)
      else setLoading(true)

      setError("")
      setSuccessMessage("")

      const [paymentData, revenueData] = await Promise.all([
        getAllPayments(),
        getRevenue(),
      ])

      setPayments(Array.isArray(paymentData) ? paymentData : [])
      setRevenue(revenueData ?? 0)
    } catch (err) {
      setError(err?.message || "Unable to load payment information.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleRefund(payment) {
    if (payment.status !== "SUCCESS") return
    if (!window.confirm(`Refund ${formatAmount(payment.amount)} for payment #${payment.id}?`)) return

    try {
      setRefundingId(payment.id)
      setError("")
      setSuccessMessage("")

      await refundPayment(payment.id)
      setSuccessMessage(`Payment #${payment.id} has been refunded successfully.`)
      await loadData(true)
    } catch (err) {
      setError(err?.message || "Unable to refund the payment.")
    } finally {
      setRefundingId(null)
    }
  }

  async function handleCancelPendingBooking(payment) {
    if (payment.status !== "PENDING" || !payment.bookingId) return
    if (!window.confirm(`Cancel booking #${payment.bookingId}? The pending payment will remain pending, but the booking will be cancelled.`)) return

    try {
      setCancellingBookingId(payment.bookingId)
      setError("")
      setSuccessMessage("")

      await updateBookingStatus(payment.bookingId, "CANCELLED")
      setSuccessMessage(`Booking #${payment.bookingId} has been cancelled.`)
      await loadData(true)
    } catch (err) {
      setError(err?.message || "Unable to cancel the booking.")
    } finally {
      setCancellingBookingId(null)
    }
  }

  function handleViewBooking(payment) {
    if (!payment.bookingId) return
    navigate(`/bookings/${payment.bookingId}`)
  }

  const stats = useMemo(() => {
    let successful = 0, pending = 0, failed = 0, refunded = 0
    for (const payment of payments) {
      if (payment.status === "SUCCESS") successful++
      else if (payment.status === "PENDING") pending++
      else if (payment.status === "FAILED") failed++
      else if (payment.status === "REFUNDED") refunded++
    }

    return { total: payments.length, successful, pending, failed, refunded }
  }, [payments])

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-7xl animate-pulse space-y-8">
          <div className="h-10 w-64 bg-slate-200 rounded-lg" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[...Array(5)].map((_, i) => <div key={i} className="h-32 bg-slate-200 rounded-2xl" />)}
          </div>
          <div className="h-[500px] bg-slate-200 rounded-3xl" />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">

        <PageHeader
          eyebrow="Administration"
          title="Payments"
          description="Monitor payments, revenue, and refunds."
          action={
            <Button variant="outline" onClick={() => loadData(true)} disabled={refreshing} className="bg-white">
              <RefreshCcw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
            </Button>
          }
        />

        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-700">
            {successMessage}
          </div>
        )}

        <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Successful Revenue"
            value={formatAmount(revenue)}
            icon={TrendingUp}
          />
          <StatCard title="Total Payments" value={stats.total} />
          <StatCard title="Successful" value={stats.successful} />
          <StatCard title="Pending" value={stats.pending} />
          <StatCard title="Refunded" value={stats.refunded} />
        </div>

        {payments.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No payments found"
            description="Payment records will appear here when customers make bookings."
          />
        ) : (
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Payment Transactions</h2>
                <p className="mt-1 text-sm text-slate-500">All payment transactions recorded by the system.</p>
              </div>
            </div>

            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-[1250px] w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Payment</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Customer</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Booking</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Amount</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Method</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Created</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-5">
                        <p className="font-semibold text-slate-900">#{payment.id}</p>
                        <p className="text-xs text-slate-500 mt-1">{payment.paymentReference || "—"}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-medium text-slate-900">{payment.guestName || "—"}</p>
                        <p className="text-xs text-slate-500 mt-1">{payment.email || "—"}</p>
                      </td>
                      <td className="px-6 py-5">
                        <button
                          type="button"
                          onClick={() => handleViewBooking(payment)}
                          disabled={!payment.bookingId}
                          className="font-medium text-emerald-600 hover:text-emerald-700 disabled:text-slate-400 disabled:no-underline"
                        >
                          {payment.bookingId ? `#${payment.bookingId}` : "—"}
                        </button>
                      </td>
                      <td className="px-6 py-5 font-semibold text-slate-900">{formatAmount(payment.amount)}</td>
                      <td className="px-6 py-5 text-sm text-slate-600">{payment.paymentMethod || "—"}</td>
                      <td className="px-6 py-5">
                        <PaymentStatusBadge status={payment.status} />
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-600">{formatDate(payment.createdAt)}</td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" className="bg-white" disabled={!payment.bookingId} onClick={() => handleViewBooking(payment)}>
                            View
                          </Button>

                          {payment.status === "SUCCESS" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={refundingId === payment.id}
                              onClick={() => handleRefund(payment)}
                              className="bg-white text-red-600 border border-red-200 hover:bg-red-50"
                            >
                              Refund
                            </Button>
                          )}

                          {payment.status === "PENDING" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={cancellingBookingId === payment.bookingId}
                              onClick={() => handleCancelPendingBooking(payment)}
                              className="bg-white text-red-600 border border-red-200 hover:bg-red-50"
                            >
                              Cancel Booking
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden divide-y divide-slate-100">
              {payments.map((payment) => (
                <div key={payment.id} className="p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 mb-1 block">#{payment.id}</span>
                      <h3 className="font-semibold text-slate-900">{formatAmount(payment.amount)}</h3>
                      <p className="text-sm text-slate-500">{payment.guestName || "Unknown"}</p>
                    </div>
                    <PaymentStatusBadge status={payment.status} />
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewBooking(payment)} disabled={!payment.bookingId} className="flex-1 bg-white">
                      View
                    </Button>

                    {payment.status === "SUCCESS" && (
                      <Button size="sm" variant="outline" disabled={refundingId === payment.id} onClick={() => handleRefund(payment)} className="flex-1 text-red-600 border-red-200 hover:bg-red-50">
                        Refund
                      </Button>
                    )}

                    {payment.status === "PENDING" && (
                      <Button size="sm" variant="outline" disabled={cancellingBookingId === payment.bookingId} onClick={() => handleCancelPendingBooking(payment)} className="flex-1 text-red-600 border-red-200 hover:bg-red-50">
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  )
}
