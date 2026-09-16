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
      icon: RotateCcw,
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

export default function AdminPayments() {
  const navigate = useNavigate()

  const [payments, setPayments] = useState([])
  const [revenue, setRevenue] = useState(0)

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [refundingId, setRefundingId] = useState(null)
  const [cancellingBookingId, setCancellingBookingId] =
    useState(null)

  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  async function loadData(showRefreshState = false) {
    try {
      if (showRefreshState) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      setError("")
      setSuccessMessage("")

      const [paymentData, revenueData] =
        await Promise.all([
          getAllPayments(),
          getRevenue(),
        ])

      setPayments(
        Array.isArray(paymentData)
          ? paymentData
          : []
      )

      setRevenue(
        revenueData === null ||
          revenueData === undefined
          ? 0
          : revenueData
      )
    } catch (err) {
      setError(
        err?.message ||
          "Unable to load payment information."
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleRefund(payment) {
    if (payment.status !== "SUCCESS") {
      return
    }

    const confirmed = window.confirm(
      `Refund ${formatAmount(
        payment.amount
      )} for payment #${payment.id}?`
    )

    if (!confirmed) {
      return
    }

    try {
      setRefundingId(payment.id)
      setError("")
      setSuccessMessage("")

      await refundPayment(payment.id)

      setSuccessMessage(
        `Payment #${payment.id} has been refunded successfully.`
      )

      await loadData(true)
    } catch (err) {
      setError(
        err?.message ||
          "Unable to refund the payment."
      )
    } finally {
      setRefundingId(null)
    }
  }

  async function handleCancelPendingBooking(payment) {
    if (
      payment.status !== "PENDING" ||
      !payment.bookingId
    ) {
      return
    }

    const confirmed = window.confirm(
      `Cancel booking #${payment.bookingId}? The pending payment will remain pending, but the booking will be cancelled.`
    )

    if (!confirmed) {
      return
    }

    try {
      setCancellingBookingId(payment.bookingId)
      setError("")
      setSuccessMessage("")

      await updateBookingStatus(
        payment.bookingId,
        "CANCELLED"
      )

      setSuccessMessage(
        `Booking #${payment.bookingId} has been cancelled.`
      )

      await loadData(true)
    } catch (err) {
      setError(
        err?.message ||
          "Unable to cancel the booking."
      )
    } finally {
      setCancellingBookingId(null)
    }
  }

  function handleViewBooking(payment) {
    if (!payment.bookingId) {
      return
    }

    navigate(
      `/bookings/${payment.bookingId}`
    )
  }

  const statistics = useMemo(() => {
    let successful = 0
    let pending = 0
    let failed = 0
    let refunded = 0

    for (const payment of payments) {
      switch (payment.status) {
        case "SUCCESS":
          successful += 1
          break

        case "PENDING":
          pending += 1
          break

        case "FAILED":
          failed += 1
          break

        case "REFUNDED":
          refunded += 1
          break

        default:
          break
      }
    }

    return {
      total: payments.length,
      successful,
      pending,
      failed,
      refunded,
    }
  }, [payments])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* HEADER */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Administration
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Payments
            </h1>

            <p className="mt-2 text-slate-600">
              Monitor payments, revenue, and refunds.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}

            Refresh
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <XCircle className="mt-0.5 h-5 w-5 text-red-600" />

              <div>
                <p className="font-semibold text-red-800">
                  Something went wrong
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SUCCESS */}
        {successMessage && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />

              <p className="text-sm font-medium text-emerald-800">
                {successMessage}
              </p>
            </div>
          </div>
        )}

        {/* STATISTICS */}
        {!loading && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

            {/* REVENUE */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-slate-100 p-2.5">
                  <TrendingUp className="h-5 w-5 text-slate-700" />
                </div>
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                Successful Revenue
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {formatAmount(revenue)}
              </p>
            </div>

            {/* TOTAL */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="w-fit rounded-xl bg-slate-100 p-2.5">
                <CreditCard className="h-5 w-5 text-slate-700" />
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                Total Payments
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {statistics.total}
              </p>
            </div>

            {/* SUCCESSFUL */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="w-fit rounded-xl bg-emerald-50 p-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                Successful
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {statistics.successful}
              </p>
            </div>

            {/* PENDING */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="w-fit rounded-xl bg-blue-50 p-2.5">
                <Clock3 className="h-5 w-5 text-blue-600" />
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                Pending
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {statistics.pending}
              </p>
            </div>

            {/* FAILED */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="w-fit rounded-xl bg-red-50 p-2.5">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                Failed
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {statistics.failed}
              </p>
            </div>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
            <div className="flex items-center justify-center gap-3 text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading payments...
            </div>
          </div>
        )}

        {/* EMPTY */}
        {!loading && payments.length === 0 && !error && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <CreditCard className="mx-auto h-10 w-10 text-slate-400" />

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No payments found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Payment records will appear here when
              customers make bookings.
            </p>
          </div>
        )}

        {/* PAYMENT TABLE */}
        {!loading && payments.length > 0 && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Payment Transactions
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                All payment transactions recorded by the
                system.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1250px]">

                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Payment
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Customer
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
                      Created
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="transition hover:bg-slate-50"
                    >

                      {/* PAYMENT */}
                      <td className="px-6 py-5">
                        <p className="font-semibold text-slate-900">
                          #{payment.id}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {payment.paymentReference || "—"}
                        </p>
                      </td>

                      {/* CUSTOMER */}
                      <td className="px-6 py-5">
                        <p className="font-medium text-slate-900">
                          {payment.guestName || "—"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {payment.email || "—"}
                        </p>
                      </td>

                      {/* BOOKING */}
                      <td className="px-6 py-5">
                        <button
                          type="button"
                          onClick={() =>
                            handleViewBooking(payment)
                          }
                          disabled={!payment.bookingId}
                          className="inline-flex items-center gap-1.5 font-medium text-slate-900 underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
                        >
                          #{payment.bookingId}
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </td>

                      {/* AMOUNT */}
                      <td className="px-6 py-5 font-semibold text-slate-900">
                        {formatAmount(payment.amount)}
                      </td>

                      {/* METHOD */}
                      <td className="px-6 py-5 text-sm text-slate-600">
                        {payment.paymentMethod || "—"}
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-5">
                        <StatusBadge
                          status={payment.status}
                        />
                      </td>

                      {/* CREATED */}
                      <td className="px-6 py-5 text-sm text-slate-600">
                        {formatDate(payment.createdAt)}
                      </td>

                      {/* ACTION */}
                      <td className="px-6 py-5 text-right">

                        {payment.status === "SUCCESS" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleRefund(payment)
                            }
                            disabled={
                              refundingId === payment.id
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {refundingId === payment.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <RotateCcw className="h-3.5 w-3.5" />
                            )}

                            Refund
                          </button>
                        )}

                        {payment.status === "PENDING" && (
                          <div className="flex items-center justify-end gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                handleViewBooking(payment)
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleCancelPendingBooking(
                                  payment
                                )
                              }
                              disabled={
                                cancellingBookingId ===
                                payment.bookingId
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {cancellingBookingId ===
                              payment.bookingId ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <XCircle className="h-3.5 w-3.5" />
                              )}

                              Cancel Booking
                            </button>

                          </div>
                        )}

                        {payment.status === "FAILED" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleViewBooking(payment)
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </button>
                        )}

                        {payment.status === "REFUNDED" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleViewBooking(payment)
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </button>
                        )}

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>
            </div>
          </div>
        )}

        {/* REFUNDED COUNT */}
        {!loading && payments.length > 0 && (
          <div className="mt-4 text-right text-sm text-slate-500">
            Refunded payments:{" "}
            <span className="font-semibold text-slate-700">
              {statistics.refunded}
            </span>
          </div>
        )}

      </div>
    </div>
  )
}