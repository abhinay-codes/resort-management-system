import { useEffect, useState } from "react"

import { getRooms } from "@/services/roomService"
import { updateRoomState } from "@/services/operations/roomStateService"

const ROOM_STATUSES = [
  "AVAILABLE",
  "BOOKED",
  "OCCUPIED",
  "CLEANING",
  "MAINTENANCE",
]

function formatStatus(status) {
  if (!status) {
    return "UNKNOWN"
  }

  return status.replaceAll("_", " ")
}

function getStatusClasses(status) {
  switch (status) {
    case "AVAILABLE":
      return "bg-green-100 text-green-800"

    case "BOOKED":
      return "bg-blue-100 text-blue-800"

    case "OCCUPIED":
      return "bg-purple-100 text-purple-800"

    case "CLEANING":
      return "bg-yellow-100 text-yellow-800"

    case "MAINTENANCE":
      return "bg-red-100 text-red-800"

    default:
      return "bg-gray-100 text-gray-700"
  }
}

function AdminRooms() {
  const [rooms, setRooms] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [updatingRoomId, setUpdatingRoomId] = useState(null)

  async function loadRooms() {
    try {
      setLoading(true)
      setError("")

      const data = await getRooms()

      setRooms(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(
        "Failed to load rooms:",
        err
      )

      setError(
        err?.message ||
          "Unable to load rooms."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRooms()
  }, [])

  async function handleStatusChange(
    roomId,
    status
  ) {
    try {
      setUpdatingRoomId(roomId)
      setError("")

      const updatedRoom =
        await updateRoomState(
          roomId,
          status
        )

      setRooms((currentRooms) =>
        currentRooms.map((room) =>
          room.id === roomId
            ? updatedRoom
            : room
        )
      )
    } catch (err) {
      console.error(
        "Failed to update room status:",
        err
      )

      setError(
        err?.message ||
          "Unable to update room status."
      )
    } finally {
      setUpdatingRoomId(null)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-gray-600">
            Loading rooms...
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Resort Administration
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Room Management
          </h1>

          <p className="mt-2 text-gray-600">
            View rooms and manage their current
            physical status.
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ROOM SUMMARY */}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {ROOM_STATUSES.map((status) => {
            const count =
              rooms.filter(
                (room) =>
                  room.status === status
              ).length

            return (
              <div
                key={status}
                className="rounded-2xl border bg-white p-5 shadow-sm"
              >
                <p className="text-sm text-gray-500">
                  {formatStatus(status)}
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {count}
                </p>
              </div>
            )
          })}
        </div>

        {/* ROOMS */}

        <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="border-b px-6 py-5">
            <h2 className="text-xl font-semibold">
              All Rooms
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {rooms.length} room
              {rooms.length === 1
                ? ""
                : "s"} in the system
            </p>
          </div>

          {rooms.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              No rooms found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Room
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Capacity
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Price
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Current Status
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Change Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {rooms.map((room) => (
                    <tr
                      key={room.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-5">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {room.name ||
                              `Room ${room.id}`}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            Room ID: {room.id}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm text-gray-700">
                        {room.guests} guests
                      </td>

                      <td className="px-6 py-5 text-sm font-medium text-gray-900">
                        ₹
                        {Number(
                          room.price || 0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                            room.status
                          )}`}
                        >
                          {formatStatus(
                            room.status
                          )}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <select
                          value={
                            room.status || ""
                          }
                          disabled={
                            updatingRoomId ===
                            room.id
                          }
                          onChange={(event) =>
                            handleStatusChange(
                              room.id,
                              event.target.value
                            )
                          }
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-black disabled:cursor-not-allowed disabled:bg-gray-100"
                        >
                          {ROOM_STATUSES.map(
                            (status) => (
                              <option
                                key={status}
                                value={status}
                              >
                                {formatStatus(
                                  status
                                )}
                              </option>
                            )
                          )}
                        </select>

                        {updatingRoomId ===
                          room.id && (
                          <p className="mt-2 text-xs text-gray-500">
                            Updating...
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* IMPORTANT NOTE */}

        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          Room status changes are validated by
          the backend room-state rules. An invalid
          transition will be rejected rather than
          directly modifying the room.
        </div>

      </div>
    </main>
  )
}

export default AdminRooms