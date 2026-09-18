import { useEffect, useState } from "react"
import { Wrench } from "lucide-react"

import {
  getEmployeeMaintenanceRooms,
  employeeReportMaintenance,
  employeeResolveMaintenance,
} from "@/services/operations/maintenanceService"

import { PageHeader } from "@/components/ui/PageHeader"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/EmptyState"

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
      const data = await getEmployeeMaintenanceRooms()
      setRooms(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.message || "Failed to load maintenance rooms.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRooms()
  }, [])

  async function handleReport(roomId) {
    const note = notes[roomId]?.trim()
    if (!note) {
      setError("Please enter a maintenance note.")
      return
    }

    try {
      setActionId(roomId)
      setError("")

      const updatedRoom = await employeeReportMaintenance(roomId, note)
      setRooms((current) => current.map((r) => (r.id === roomId ? updatedRoom : r)))
      setNotes((current) => ({ ...current, [roomId]: "" }))
    } catch (err) {
      setError(err?.message || "Failed to report maintenance.")
    } finally {
      setActionId(null)
    }
  }

  async function handleResolve(roomId) {
    try {
      setActionId(roomId)
      setError("")

      const updatedRoom = await employeeResolveMaintenance(roomId)
      setRooms((current) => current.map((r) => (r.id === roomId ? updatedRoom : r)))
    } catch (err) {
      setError(err?.message || "Failed to resolve maintenance.")
    } finally {
      setActionId(null)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-10 w-64 bg-slate-200 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="h-64 bg-slate-200 rounded-3xl" />
            <div className="h-64 bg-slate-200 rounded-3xl" />
            <div className="h-64 bg-slate-200 rounded-3xl" />
          </div>
        </div>
      </main>
    )
  }

  const maintenanceRooms = rooms.filter((r) => r.status === "MAINTENANCE")
  const otherRooms = rooms.filter((r) => r.status !== "MAINTENANCE")

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          eyebrow="Resort Operations"
          title="Maintenance"
          description="Report and resolve room maintenance issues."
        />

        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>
        )}

        {rooms.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No rooms found"
            description="There are currently no rooms available to manage."
          />
        ) : (
          <div className="space-y-12">
            {/* Rooms currently in maintenance */}
            {maintenanceRooms.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-4 ml-2">Needs Attention</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {maintenanceRooms.map((room) => (
                    <div key={room.id} className="rounded-3xl border border-orange-200 bg-orange-50/50 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <StatusBadge status={room.status} />
                          <span className="text-xs font-medium text-slate-400">Room #{room.id}</span>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900">{room.name}</h3>
                        {room.description && (
                          <p className="mt-2 text-sm text-slate-700">{room.description}</p>
                        )}
                      </div>
                      <div className="mt-6 pt-6 border-t border-orange-200/50">
                        <Button
                          variant="outline"
                          className="w-full bg-white hover:bg-orange-50"
                          disabled={actionId === room.id}
                          onClick={() => handleResolve(room.id)}
                        >
                          {actionId === room.id ? "Resolving..." : "Resolve Maintenance"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Other rooms to report maintenance on */}
            {otherRooms.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-4 ml-2">Report Issue</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {otherRooms.map((room) => (
                    <div key={room.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <StatusBadge status={room.status} />
                          <span className="text-xs font-medium text-slate-400">Room #{room.id}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">{room.name}</h3>
                      </div>
                      <div className="mt-4">
                        <textarea
                          value={notes[room.id] || ""}
                          onChange={(e) => setNotes((curr) => ({ ...curr, [room.id]: e.target.value }))}
                          placeholder="Describe the issue..."
                          rows={3}
                          className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 resize-none mb-3"
                        />
                        <Button
                          className="w-full"
                          disabled={actionId === room.id}
                          onClick={() => handleReport(room.id)}
                        >
                          {actionId === room.id ? "Reporting..." : "Report Maintenance"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

export default EmployeeMaintenance
