import { useEffect, useState } from "react"
import { AlertTriangle, CheckCircle2, Wrench, ShieldCheck } from "lucide-react"

import { getMaintenanceRooms, reportMaintenance, resolveMaintenance } from "@/services/operations/maintenanceService"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/PageHeader"
import { EmptyState } from "@/components/ui/EmptyState"

function Maintenance() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [roomId, setRoomId] = useState("")
  const [note, setNote] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function loadRooms() {
    try {
      setLoading(true)
      setError("")
      const data = await getMaintenanceRooms()
      setRooms(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRooms()
  }, [])

  async function handleReport(event) {
    event.preventDefault()
    if (!roomId || !note.trim()) {
      setError("Room and maintenance note are required.")
      return
    }

    try {
      setSubmitting(true)
      setError("")
      await reportMaintenance(Number(roomId), note.trim())
      setRoomId("")
      setNote("")
      await loadRooms()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResolve(id) {
    try {
      setSubmitting(true)
      setError("")
      await resolveMaintenance(id)
      await loadRooms()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-7xl animate-pulse space-y-8">
          <div className="h-10 w-64 bg-slate-200 rounded-lg" />
          <div className="h-48 bg-slate-200 rounded-3xl" />
          <div className="h-96 bg-slate-200 rounded-3xl" />
        </div>
      </main>
    )
  }

  const maintenanceRooms = rooms.filter((room) => room.status === "MAINTENANCE")

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          eyebrow="Resort Operations"
          title="Maintenance Management"
          description="Report room issues and return repaired rooms to service."
        />

        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Report Issue</h2>
              <p className="text-sm text-slate-500">Take a room out of service for repairs.</p>
            </div>
          </div>

          <form onSubmit={handleReport} className="grid gap-4 md:grid-cols-[1fr_2fr_auto]">
            <select
              value={roomId}
              onChange={(event) => setRoomId(event.target.value)}
              className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              <option value="">Select room</option>
              {rooms.filter((room) => room.status !== "MAINTENANCE").map((room) => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>

            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Describe the issue"
              className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />

            <Button type="submit" disabled={submitting} className="min-h-[46px] rounded-xl bg-orange-600 hover:bg-orange-700 text-white">
              {submitting ? "Saving..." : "Report Issue"}
            </Button>
          </form>
        </section>

        {maintenanceRooms.length > 0 ? (
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5 bg-slate-50/50">
              <h2 className="text-xl font-semibold text-slate-900">Rooms Under Maintenance</h2>
              <p className="mt-1 text-sm text-slate-500">{maintenanceRooms.length} room(s) currently affected.</p>
            </div>

            <div className="divide-y divide-slate-100">
              {maintenanceRooms.map((room) => (
                <div key={room.id} className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                        <Wrench className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold text-slate-900">{room.name}</h3>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">Room #{room.id}</p>
                  </div>
                  <Button variant="outline" disabled={submitting} onClick={() => handleResolve(room.id)} className="bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200">
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Resolve & Return to Service
                  </Button>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <EmptyState
            icon={ShieldCheck}
            title="All rooms operational"
            description="There are currently no rooms under maintenance."
          />
        )}
      </div>
    </main>
  )
}

export default Maintenance
