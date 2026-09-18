import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  CreditCard,
  Loader2,
  RefreshCcw,
  XCircle,
} from "lucide-react"

import { getPaymentHistory } from "@/services/payment/paymentService"
import { PageHeader } from "@/components/ui/PageHeader"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { EmptyState } from "@/components/ui/EmptyState"
import { Button } from "@/components/ui/button"

function formatAmount(amount) {
  if (amount === null || amount === undefined) {
    return "₹0.00"
  }

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

export default function CustomerPayments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadPayments() {
      try {
        setLoading(true)
        setError("")

        const data = await getPaymentHistory()
        setPayments(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err?.message || "Unable to load payment history.")
      } finally {
        setLoading(false)
      }
    }

    loadPayments()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-16">

        <Link
          to="/customer"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <PageHeader
          eyebrow="Financials"
          title="Payment History"
          description="View your resort booking payments."
        />

        {loading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-400" />
            <p className="mt-4 text-slate-500">Loading payments...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
            <h2 className="font-semibold text-red-800 text-lg">Unable to load payments</h2>
            <p className="mt-2 text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && payments.length === 0 && (
          <EmptyState
            icon={CreditCard}
            title="No payments yet"
            description="Payments for your bookings will appear here."
            action={
              <Link to="/rooms">
                <Button>Browse Rooms</Button>
              </Link>
            }
          />
        )}

        {!loading && !error && payments.length > 0 && (
          <>
            {/* Desktop View */}
            <div className="hidden md:block overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left">
                <thead className="border-b border-slate-100 bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Payment</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Booking</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Amount</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Method</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="transition hover:bg-slate-50">
                      <td className="px-6 py-5">
                        <p className="font-semibold text-slate-900">#{payment.id}</p>
                        <p className="text-xs text-slate-500">{payment.paymentReference || "—"}</p>
                      </td>
                      <td className="px-6 py-5">
                        <Link to={`/customer/bookings/${payment.bookingId}`} className="font-medium text-emerald-600 hover:text-emerald-700">
                          #{payment.bookingId}
                        </Link>
                      </td>
                      <td className="px-6 py-5 font-medium text-slate-900">{formatAmount(payment.amount)}</td>
                      <td className="px-6 py-5 text-sm text-slate-600">{payment.paymentMethod || "—"}</td>
                      <td className="px-6 py-5 text-sm text-slate-600">{formatDate(payment.createdAt)}</td>
                      <td className="px-6 py-5 text-right">
                        <StatusBadge status={payment.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-slate-900">#{payment.id}</p>
                      <p className="text-xs text-slate-500">{formatDate(payment.createdAt)}</p>
                    </div>
                    <StatusBadge status={payment.status} />
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
                    <p className="font-semibold text-lg text-slate-900">{formatAmount(payment.amount)}</p>
                    <Link to={`/customer/bookings/${payment.bookingId}`} className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                      Booking #{payment.bookingId}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
