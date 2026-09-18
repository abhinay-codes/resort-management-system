import { useEffect, useState } from "react"
import { BedDouble, Users, Sparkles, AlertTriangle } from "lucide-react"

import { getEmployeeOperationsDashboard } from "@/services/operations/dashboardService"
import { PageHeader } from "@/components/ui/PageHeader"
import { StatCard } from "@/components/ui/StatCard"
import { Button } from "@/components/ui/button"

function OperationsDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  async function loadDashboard() {
    try {
      setLoading(true)
      setError("")
      const data = await getEmployeeOperationsDashboard()
      setDashboard(data)
    } catch (err) {
      setError(err?.message || "Failed to load operations dashboard.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  if (loading) {
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
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-red-200 bg-white p-10 text-center shadow-sm max-w-lg">
            <h1 className="text-xl font-semibold text-slate-900">Unable to load dashboard</h1>
            <p className="mt-2 text-slate-600">{error}</p>
            <Button onClick={loadDashboard} className="mt-6">Retry</Button>
          </div>
        </div>
      </main>
    )
  }

  if (!dashboard) return null

  const { rooms, bookings, housekeeping, staff } = dashboard

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-12">
        <PageHeader
          eyebrow="Resort Operations"
          title="Operations Dashboard"
          description="Current operational overview of the resort."
        />

        {/* PRIMARY: Today's Actionable Overview */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 ml-1 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" /> Today's Focus
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Today's Check-ins"
              value={bookings.todayCheckIns}
              icon={Users}
              className={bookings.todayCheckIns > 0 ? "border-amber-200 bg-amber-50/30" : ""}
            />
            <StatCard
              title="Today's Check-outs"
              value={bookings.todayCheckOuts}
              icon={Users}
            />
            <StatCard
              title="Housekeeping Pending"
              value={housekeeping.pending}
              icon={Sparkles}
              className={housekeeping.pending > 0 ? "border-purple-200 bg-purple-50/30" : ""}
            />
            <StatCard
              title="Rooms in Maintenance"
              value={rooms.maintenance}
              icon={WrenchIcon}
              className={rooms.maintenance > 0 ? "border-orange-200 bg-orange-50/30" : ""}
            />
          </div>
        </section>

        {/* SECONDARY: Room Status */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 ml-1 flex items-center gap-2">
            <BedDouble className="h-5 w-5 text-blue-500" /> Room Status
          </h2>
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
            <StatCard title="Total Rooms" value={rooms.total} />
            <StatCard title="Available" value={rooms.available} />
            <StatCard title="Booked" value={rooms.booked} />
            <StatCard title="Occupied" value={rooms.occupied} />
            <StatCard title="Cleaning" value={rooms.cleaning} />
          </div>
        </section>

        {/* TERTIARY: Bookings & Staff Summary */}
        <div className="grid gap-12 lg:grid-cols-2">
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 ml-1">Overall Bookings</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <StatCard title="Pending Confirmation" value={bookings.pending} />
              <StatCard title="Total Confirmed" value={bookings.confirmed} />
              <StatCard title="Currently Checked In" value={bookings.checkedIn} />
              <StatCard title="Cancelled" value={bookings.cancelled} />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 ml-1">Staff Overview</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <StatCard title="Active Employees" value={staff.activeEmployees} />
              <StatCard title="Total Employees" value={staff.totalEmployees} />
            </div>
          </section>
        </div>

      </div>
    </main>
  )
}

function WrenchIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  )
}

export default OperationsDashboard
