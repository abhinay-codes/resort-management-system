import { useEffect, useState } from "react"

import {
  getEmployeeOperationsDashboard,
} from "@/services/operations/dashboardService"

function StatCard({
  title,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold text-gray-900">
        {value}
      </p>

      {description && (
        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>
      )}
    </div>
  )
}

function OperationsDashboard() {
  const [dashboard, setDashboard] = useState(null)

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState("")

  async function loadDashboard() {
    try {
      setLoading(true)
      setError("")

      const data =
        await getEmployeeOperationsDashboard()

      setDashboard(data)

    } catch (err) {
      setError(
        err?.message ||
        "Failed to load operations dashboard."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-gray-600">
            Loading operations dashboard...
          </p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-7xl">

          <div className="rounded-2xl border bg-white p-8">

            <h1 className="text-xl font-semibold text-gray-900">
              Unable to load dashboard
            </h1>

            <p className="mt-2 text-gray-600">
              {error}
            </p>

            <button
              type="button"
              onClick={loadDashboard}
              className="mt-6 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-100"
            >
              Retry
            </button>

          </div>

        </div>
      </main>
    )
  }

  if (!dashboard) {
    return null
  }

  const {
    rooms,
    bookings,
    housekeeping,
    staff,
  } = dashboard

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        <div className="mb-10">

          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Resort Operations
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
            Operations Dashboard
          </h1>

          <p className="mt-2 text-gray-600">
            Current operational overview of the resort.
          </p>

        </div>

        {/* ROOMS */}

        <section>

          <h2 className="mb-4 text-xl font-semibold">
            Rooms
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <StatCard
              title="Total Rooms"
              value={rooms.total}
            />

            <StatCard
              title="Available"
              value={rooms.available}
            />

            <StatCard
              title="Booked"
              value={rooms.booked}
            />

            <StatCard
              title="Occupied"
              value={rooms.occupied}
            />

            <StatCard
              title="Cleaning"
              value={rooms.cleaning}
            />

            <StatCard
              title="Maintenance"
              value={rooms.maintenance}
            />

          </div>

        </section>

        {/* BOOKINGS */}

        <section className="mt-10">

          <h2 className="mb-4 text-xl font-semibold">
            Bookings
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <StatCard
              title="Total"
              value={bookings.total}
            />

            <StatCard
              title="Pending"
              value={bookings.pending}
            />

            <StatCard
              title="Confirmed"
              value={bookings.confirmed}
            />

            <StatCard
              title="Checked In"
              value={bookings.checkedIn}
            />

            <StatCard
              title="Checked Out"
              value={bookings.checkedOut}
            />

            <StatCard
              title="Cancelled"
              value={bookings.cancelled}
            />

            <StatCard
              title="Today's Check-ins"
              value={bookings.todayCheckIns}
            />

            <StatCard
              title="Today's Check-outs"
              value={bookings.todayCheckOuts}
            />

          </div>

        </section>

        {/* HOUSEKEEPING */}

        <section className="mt-10">

          <h2 className="mb-4 text-xl font-semibold">
            Housekeeping
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <StatCard
              title="Pending"
              value={housekeeping.pending}
            />

            <StatCard
              title="In Progress"
              value={housekeeping.inProgress}
            />

            <StatCard
              title="Completed"
              value={housekeeping.completed}
            />

            <StatCard
              title="Cancelled"
              value={housekeeping.cancelled}
            />

          </div>

        </section>

        {/* STAFF */}

        <section className="mt-10">

          <h2 className="mb-4 text-xl font-semibold">
            Staff
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">

            <StatCard
              title="Active Employees"
              value={staff.activeEmployees}
            />

            <StatCard
              title="Total Employees"
              value={staff.totalEmployees}
            />

          </div>

        </section>

      </div>

    </main>
  )
}

export default OperationsDashboard