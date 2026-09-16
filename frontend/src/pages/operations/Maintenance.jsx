import { useEffect, useState } from "react"
import { AlertTriangle, CheckCircle2, Wrench } from "lucide-react"

import { getMaintenanceRooms, reportMaintenance, resolveMaintenance } from "@/services/operations/maintenanceService"
import { Button } from "@/components/ui/button"

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
      <main className="min-h-screen bg-muted/30">
        <div className="page-container py-16">
          <div className="resort-card p-8 text-muted-foreground">Loading maintenance...</div>
        </div>
      </main>
    )
  }

  const maintenanceRooms = rooms.filter((room) => room.status === "MAINTENANCE")

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="page-container py-10 sm:py-14">
        <header className="page-header">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Resort Operations
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Maintenance</h1>
            <p className="mt-3 text-muted-foreground">
              Report room issues and return repaired rooms to service.
            </p>
          </div>
          <div className="flex size-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <Wrench className="size-5" />
          </div>
        </header>

        {error && (
          <div className="mt-6 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <section className="resort-card mt-8 p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold">Report Maintenance</h2>
              <p className="text-sm text-muted-foreground">Take a room out of service when an issue is found.</p>
            </div>
          </div>

          <form onSubmit={handleReport} className="mt-6 grid gap-4 md:grid-cols-[1fr_2fr_auto]">
            <select
              value={roomId}
              onChange={(event) => setRoomId(event.target.value)}
              className="min-h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
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
              className="min-h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />

            <Button type="submit" disabled={submitting} className="min-h-11 rounded-xl">
              {submitting ? "Saving..." : "Report Issue"}
            </Button>
          </form>
        </section>

        <section className="resort-card mt-6 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/60 p-6">
            <div>
              <h2 className="text-xl font-semibold">Rooms Under Maintenance</h2>
              <p className="mt-1 text-sm text-muted-foreground">{maintenanceRooms.length} room(s) currently affected.</p>
            </div>
          </div>

          {maintenanceRooms.length > 0 ? (
            <div className="divide-y divide-border/60">
              {maintenanceRooms.map((room) => (
                <div key={room.id} className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                        <Wrench className="size-4" />
                      </div>
                      <h3 className="font-semibold">{room.name}</h3>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">Room #{room.id}</p>
                  </div>
                  <Button variant="outline" disabled={submitting} onClick={() => handleResolve(room.id)}>
                    <CheckCircle2 className="size-4" />
                    Resolve
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <CheckCircle2 className="mx-auto size-8 text-primary" />
              <p className="mt-3 font-medium">No rooms currently under maintenance.</p>
              <p className="mt-1 text-sm text-muted-foreground">Everything is operational.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default Maintenance
