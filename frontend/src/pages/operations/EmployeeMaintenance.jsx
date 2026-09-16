import { useEffect, useState } from "react"

import {
  getEmployeeMaintenanceRooms,
  employeeReportMaintenance,
  employeeResolveMaintenance,
} from "@/services/operations/maintenanceService"

function EmployeeMaintenance() {
  const [rooms, setRooms] = useState([])

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState("")

  const [actionId, setActionId] = useState(null)

  const [notes, setNotes] = useState({})

  async function loadRooms() {
    try {
      setLoading(true)
      setError("")

      const data =
        await getEmployeeMaintenanceRooms()

      setRooms(
        Array.isArray(data)
          ? data
          : []
      )

    } catch (err) {
      setError(
        err?.message ||
        "Failed to load maintenance rooms."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRooms()
  }, [])

  async function handleReport(roomId) {
    const note =
      notes[roomId]?.trim()

    if (!note) {
      setError(
        "Please enter a maintenance note."
      )
      return
    }

    try {
      setActionId(roomId)
      setError("")

      const updatedRoom =
        await employeeReportMaintenance(
          roomId,
          note
        )

      setRooms((current) =>
        current.map((room) =>
          room.id === roomId
            ? updatedRoom
            : room
        )
      )

      setNotes((current) => ({
        ...current,
        [roomId]: "",
      }))

    } catch (err) {
      setError(
        err?.message ||
        "Failed to report maintenance."
      )
    } finally {
      setActionId(null)
    }
  }

  async function handleResolve(roomId) {
    try {
      setActionId(roomId)
      setError("")

      const updatedRoom =
        await employeeResolveMaintenance(
          roomId
        )

      setRooms((current) =>
        current.map((room) =>
          room.id === roomId
            ? updatedRoom
            : room
        )
      )

    } catch (err) {
      setError(
        err?.message ||
        "Failed to resolve maintenance."
      )
    } finally {
      setActionId(null)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-gray-600">
            Loading maintenance rooms...
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">

      <div className="mx-auto max-w-7xl">

        <div className="mb-8">

          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Resort Operations
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Maintenance
          </h1>

          <p className="mt-2 text-gray-600">
            Report and resolve room maintenance issues.
          </p>

        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          {rooms.map((room) => {

            const isMaintenance =
              room.status === "MAINTENANCE"

            return (
              <article
                key={room.id}
                className="rounded-2xl border bg-white p-6 shadow-sm"
              >

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <h2 className="text-xl font-semibold">
                      {room.name}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Room #{room.id}
                    </p>

                  </div>

                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">
                    {room.status}
                  </span>

                </div>

                {room.description && (
                  <p className="mt-4 text-sm text-gray-600">
                    {room.description}
                  </p>
                )}

                {!isMaintenance ? (
                  <div className="mt-5">

                    <textarea
                      value={notes[room.id] || ""}
                      onChange={(event) =>
                        setNotes((current) => ({
                          ...current,
                          [room.id]:
                            event.target.value,
                        }))
                      }
                      placeholder="Describe the maintenance issue..."
                      rows={4}
                      className="w-full rounded-lg border p-3 text-sm outline-none focus:border-gray-500"
                    />

                    <button
                      type="button"
                      disabled={
                        actionId === room.id
                      }
                      onClick={() =>
                        handleReport(room.id)
                      }
                      className="mt-3 w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
                    >
                      {actionId === room.id
                        ? "Reporting..."
                        : "Report Maintenance"}
                    </button>

                  </div>
                ) : (
                  <div className="mt-5">

                    <p className="text-sm text-gray-600">
                      This room is currently marked for maintenance.
                    </p>

                    <button
                      type="button"
                      disabled={
                        actionId === room.id
                      }
                      onClick={() =>
                        handleResolve(room.id)
                      }
                      className="mt-4 w-full rounded-lg border px-4 py-3 text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
                    >
                      {actionId === room.id
                        ? "Resolving..."
                        : "Resolve Maintenance"}
                    </button>

                  </div>
                )}

              </article>
            )
          })}

        </section>

        {rooms.length === 0 && (
          <div className="rounded-2xl border bg-white p-10 text-center text-gray-500">
            No maintenance rooms found.
          </div>
        )}

      </div>

    </main>
  )
}

export default EmployeeMaintenance