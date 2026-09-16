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
  if (!value) {
    return "—"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function StatusBadge({ status }) {
  const config = {
    SUCCESS: {
      label: "Success",
      icon: CheckCircle2,
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
    },

    FAILED: {
      label: "Failed",
      icon: XCircle,
      className:
        "border-red-200 bg-red-50 text-red-700",
    },

    PENDING: {
      label: "Pending",
      icon: Clock3,
      className:
        "border-blue-200 bg-blue-50 text-blue-700",
    },

    REFUNDED: {
      label: "Refunded",
      icon: RefreshCcw,
      className:
        "border-amber-200 bg-amber-50 text-amber-700",
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
        setError(
          err?.message ||
            "Unable to load payment history."
        )
      } finally {
        setLoading(false)
      }
    }

    loadPayments()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">

        <Link
          to="/customer"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-900 p-3">
              <CreditCard className="h-5 w-5 text-white" />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Payment History
              </h1>

              <p className="mt-1 text-slate-600">
                View your resort booking payments.
              </p>
            </div>
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-center gap-3 text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading payments...
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h2 className="font-semibold text-red-800">
              Unable to load payments
            </h2>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          payments.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <CreditCard className="mx-auto h-10 w-10 text-slate-400" />

              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                No payments yet
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Payments for your bookings will appear here.
              </p>

              <Link
                to="/rooms"
                className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Browse Rooms
              </Link>
            </div>
          )}

        {!loading &&
          !error &&
          payments.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Payment
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Booking
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Amount
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Method
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {payments.map((payment) => (
                      <tr
                        key={payment.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-5">
                          <p className="font-semibold text-slate-900">
                            #{payment.id}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {payment.paymentReference || "—"}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <Link
                            to={`/customer/bookings/${payment.bookingId}`}
                            className="font-medium text-slate-900 hover:underline"
                          >
                            Booking #{payment.bookingId}
                          </Link>
                        </td>

                        <td className="px-6 py-5 font-semibold text-slate-900">
                          {formatAmount(payment.amount)}
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-600">
                          {payment.paymentMethod || "—"}
                        </td>

                        <td className="px-6 py-5">
                          <StatusBadge status={payment.status} />
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-600">
                          {formatDate(payment.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
      </div>
    </div>
  )
}
