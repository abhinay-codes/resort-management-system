import React, { useState, useEffect } from 'react'
import {
  BarChart, Wallet, Users, CalendarCheck, CalendarX,
  Bed, AlertTriangle
} from 'lucide-react'

import apiClient from '@/services/apiClient'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'

export default function Analytics() {
  const [summary, setSummary] = useState(null)
  const [occupancy, setOccupancy] = useState(null)
  const [rooms, setRooms] = useState([])
  const [customers, setCustomers] = useState(null)
  const [monthly, setMonthly] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  })
  const [year, setYear] = useState(new Date().getFullYear())

  useEffect(() => {
    fetchData()
  }, [dateRange, year])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const qs = `?from=${dateRange.from}&to=${dateRange.to}`

      const [sumRes, occRes, roomRes, custRes, monthRes] = await Promise.all([
        apiClient(`/api/admin/analytics/summary${qs}`),
        apiClient(`/api/admin/analytics/occupancy${qs}`),
        apiClient(`/api/admin/analytics/rooms${qs}`),
        apiClient(`/api/admin/analytics/customers${qs}`),
        apiClient(`/api/admin/analytics/monthly?year=${year}`)
      ])

      setSummary(sumRes)
      setOccupancy(occRes)
      setRooms(roomRes)
      setCustomers(custRes)
      setMonthly(monthRes)
    } catch (err) {
      setError(err.message || 'Failed to load analytics.')
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (e) => {
    const { name, value } = e.target
    setDateRange(prev => ({ ...prev, [name]: value }))
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0)
  }

  if (loading && !summary) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-7xl animate-pulse space-y-8">
          <div className="h-10 w-64 bg-slate-200 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="h-32 bg-slate-200 rounded-2xl" />
            <div className="h-32 bg-slate-200 rounded-2xl" />
            <div className="h-32 bg-slate-200 rounded-2xl" />
            <div className="h-32 bg-slate-200 rounded-2xl" />
          </div>
          <div className="h-96 bg-slate-200 rounded-3xl" />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-8">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <PageHeader
            eyebrow="Administration"
            title="Analytics & Reports"
            description="Detailed performance metrics for your resort."
            icon={BarChart}
          />

          <div className="flex gap-2 items-center bg-white p-2.5 rounded-2xl shadow-sm border border-slate-200">
            <input
              type="date"
              name="from"
              value={dateRange.from}
              onChange={handleDateChange}
              className="border-none bg-slate-50 px-3 py-1.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-200"
            />
            <span className="text-slate-400 text-sm font-medium">to</span>
            <input
              type="date"
              name="to"
              value={dateRange.to}
              onChange={handleDateChange}
              className="border-none bg-slate-50 px-3 py-1.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </div>

        {error && (
          <div className="p-5 bg-red-50 text-red-700 border border-red-200 rounded-2xl flex items-center gap-3">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* SUMMARY CARDS */}
        {summary && customers && occupancy && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
              <div className="flex items-center gap-3 mb-4 text-slate-500">
                <div className="p-2.5 bg-emerald-50 rounded-xl">
                  <Wallet className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-sm uppercase tracking-wide">Retained Revenue</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(summary.totalRevenue)}</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
              <div className="flex items-center gap-3 mb-4 text-slate-500">
                <div className="p-2.5 bg-blue-50 rounded-xl">
                  <CalendarCheck className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-sm uppercase tracking-wide">Total Bookings</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">{summary.totalBookings}</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
              <div className="flex items-center gap-3 mb-4 text-slate-500">
                <div className="p-2.5 bg-indigo-50 rounded-xl">
                  <Bed className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-sm uppercase tracking-wide">Occupancy</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">{occupancy.occupancyPercentage.toFixed(1)}%</p>
              <p className="text-sm font-medium text-slate-500 mt-1">{occupancy.occupiedRoomNights} / {occupancy.totalAvailableRoomNights} nights</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
              <div className="flex items-center gap-3 mb-4 text-slate-500">
                <div className="p-2.5 bg-red-50 rounded-xl">
                  <CalendarX className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="font-semibold text-sm uppercase tracking-wide">Cancellation Rate</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">{summary.cancellationRate.toFixed(1)}%</p>
              <p className="text-sm font-medium text-slate-500 mt-1">{summary.cancelledBookings} cancelled</p>
            </div>
          </div>
        )}

        {/* CHARTS & CUSTOMERS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* REVENUE CHART (Tailwind CSS based) */}
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-semibold text-slate-900">Monthly Revenue</h3>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-slate-200"
              >
                {[...Array(5)].map((_, i) => (
                  <option key={i} value={new Date().getFullYear() - i}>{new Date().getFullYear() - i}</option>
                ))}
              </select>
            </div>

            <div className="h-72 flex items-end gap-2 px-2 pb-6 border-b border-slate-100">
              {monthly.map((m, i) => {
                const maxRev = Math.max(...monthly.map(x => x.revenue)) || 1
                const height = `${(m.revenue / maxRev) * 100}%`
                const monthName = new Date(m.month + "-01").toLocaleString('default', { month: 'short' })

                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
                    <div className="w-full relative flex justify-center h-full items-end">
                      <div
                        className="w-full max-w-[40px] bg-slate-800 rounded-t-md transition-all duration-500 group-hover:bg-slate-600 cursor-pointer"
                        style={{ height: height === '0%' ? '4px' : height }}
                      >
                        {/* Tooltip */}
                        <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-medium py-1.5 px-3 rounded-lg whitespace-nowrap z-10 pointer-events-none transition-all transform scale-95 group-hover:scale-100 shadow-lg">
                          {formatCurrency(m.revenue)}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-slate-500 mt-3 uppercase tracking-wider">{monthName}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* CUSTOMER STATS */}
          {customers && (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-8">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Users className="h-5 w-5 text-slate-700" />
                </div>
                Customer Insights
              </h3>

              <div className="flex-1 flex flex-col justify-center gap-8">
                <div>
                  <p className="text-sm font-medium uppercase tracking-wide text-slate-500 mb-1.5">Total Registered</p>
                  <p className="text-3xl font-bold text-slate-900">{customers.totalRegisteredCustomers}</p>
                </div>
                <div>
                  <p className="text-sm font-medium uppercase tracking-wide text-slate-500 mb-1.5">New in Period</p>
                  <p className="text-3xl font-bold text-emerald-600">+{customers.newCustomersInRange}</p>
                </div>
                <div>
                  <p className="text-sm font-medium uppercase tracking-wide text-slate-500 mb-1.5">Active (Booked in Period)</p>
                  <p className="text-3xl font-bold text-blue-600">{customers.customersWithBookingsInRange}</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ROOM PERFORMANCE */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-lg font-semibold text-slate-900">Room Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="py-4 px-6 md:px-8 text-xs font-semibold uppercase tracking-wide text-slate-500">Room</th>
                  <th className="py-4 px-6 md:px-8 text-xs font-semibold uppercase tracking-wide text-slate-500">Bookings</th>
                  <th className="py-4 px-6 md:px-8 text-xs font-semibold uppercase tracking-wide text-slate-500">Retained Revenue</th>
                  <th className="py-4 px-6 md:px-8 text-xs font-semibold uppercase tracking-wide text-slate-500">Cancellations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rooms.map((room) => (
                  <tr key={room.roomId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-5 px-6 md:px-8 font-semibold text-slate-900">{room.roomName}</td>
                    <td className="py-5 px-6 md:px-8 text-slate-700">{room.bookingCount}</td>
                    <td className="py-5 px-6 md:px-8 font-medium text-slate-900">{formatCurrency(room.retainedRevenue)}</td>
                    <td className="py-5 px-6 md:px-8 text-slate-700">{room.cancellationCount}</td>
                  </tr>
                ))}
                {rooms.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-slate-500">No room data available for this period.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  )
}
