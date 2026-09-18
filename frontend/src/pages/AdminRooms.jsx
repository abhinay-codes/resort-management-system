import { useEffect, useState } from "react"
import { BedDouble, Info } from "lucide-react"

import { getRooms } from "@/services/roomService"
import { PageHeader } from "@/components/ui/PageHeader"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { StatCard } from "@/components/ui/StatCard"
import { EmptyState } from "@/components/ui/EmptyState"

const ROOM_STATUSES = ["AVAILABLE", "BOOKED", "OCCUPIED", "CLEANING", "MAINTENANCE"]

function AdminRooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  async function loadRooms() {
    try {
      setLoading(true)
      setError("")
      const data = await getRooms()
      setRooms(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Failed to load rooms:", err)
      setError(err?.message || "Unable to load rooms.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRooms()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-7xl animate-pulse space-y-8">
          <div className="h-10 w-64 bg-slate-200 rounded-lg" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-2xl" />
            ))}
          </div>
          <div className="h-[500px] bg-slate-200 rounded-3xl" />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">

        <PageHeader
          eyebrow="Resort Administration"
          title="Room Management"
          description="View each room's current physical status."
        />

        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>
        )}

        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {ROOM_STATUSES.map((status) => {
            const count = rooms.filter((room) => room.status === status).length
            return (
              <StatCard
                key={status}
                title={status.replaceAll("_", " ")}
                value={count}
                className="py-4 px-5"
              />
            )
          })}
        </div>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5 bg-slate-50/50">
            <h2 className="text-xl font-semibold text-slate-900">All Rooms</h2>
            <p className="mt-1 text-sm text-slate-500">
              {rooms.length} room{rooms.length === 1 ? "" : "s"} in the system
            </p>
          </div>

          {rooms.length === 0 ? (
            <EmptyState
              icon={BedDouble}
              title="No rooms found"
              description="There are currently no rooms in the system."
              className="border-none rounded-none"
            />
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full w-full text-left">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Room</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Capacity</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Price</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 text-right">Current Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rooms.map((room) => (
                      <tr key={room.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-5">
                          <p className="font-semibold text-slate-900">{room.name || `Room ${room.id}`}</p>
                          <p className="text-xs text-slate-500 mt-1">Room ID: {room.id}</p>
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-700">{room.guests} guests</td>
                        <td className="px-6 py-5 font-medium text-slate-900">
                          ₹{Number(room.price || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <StatusBadge status={room.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden divide-y divide-slate-100">
                {rooms.map((room) => (
                  <div key={room.id} className="p-5 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-900">{room.name || `Room ${room.id}`}</h3>
                        <p className="text-xs text-slate-500 mt-1">ID: {room.id} • {room.guests} guests</p>
                      </div>
                      <StatusBadge status={room.status} />
                    </div>
                    <div className="pt-2">
                      <p className="font-medium text-slate-900">₹{Number(room.price || 0).toLocaleString("en-IN")} / night</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

      </div>
    </main>
  )
}

export default AdminRooms
