import { useEffect, useState } from "react"

import {
  getMyHousekeepingTasks,
  updateMyHousekeepingTaskStatus,
} from "@/services/operations/housekeepingService"

function formatStatus(status) {
  return status?.replaceAll("_", " ") || "UNKNOWN"
}

function getStatusClasses(status) {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800"

    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-800"

    case "COMPLETED":
      return "bg-green-100 text-green-800"

    case "CANCELLED":
      return "bg-gray-100 text-gray-600"

    default:
      return "bg-gray-100 text-gray-700"
  }
}

function EmployeeHousekeeping() {
  const [tasks, setTasks] = useState([])

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState("")

  const [actionId, setActionId] = useState(null)

  async function loadTasks() {
    try {
      setLoading(true)
      setError("")

      const data =
        await getMyHousekeepingTasks()

      setTasks(
        Array.isArray(data)
          ? data
          : []
      )

    } catch (err) {
      setError(
        err?.message ||
        "Failed to load housekeeping tasks."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  async function handleStatusChange(
    taskId,
    status
  ) {
    try {
      setActionId(taskId)
      setError("")

      const updatedTask =
        await updateMyHousekeepingTaskStatus(
          taskId,
          status
        )

      setTasks((current) =>
        current.map((task) =>
          task.id === taskId
            ? updatedTask
            : task
        )
      )

    } catch (err) {
      setError(
        err?.message ||
        "Failed to update housekeeping task."
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
            Loading your housekeeping tasks...
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
            My Housekeeping Tasks
          </h1>

          <p className="mt-2 text-gray-600">
            View and update housekeeping tasks assigned to you.
          </p>

        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[800px]">

              <thead className="border-b bg-gray-50">

                <tr>

                  <th className="px-5 py-4 text-left text-sm">
                    Room
                  </th>

                  <th className="px-5 py-4 text-left text-sm">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-sm">
                    Notes
                  </th>

                  <th className="px-5 py-4 text-left text-sm">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {tasks.map((task) => (

                  <tr
                    key={task.id}
                    className="border-b last:border-0"
                  >

                    <td className="px-5 py-4">

                      <p className="font-medium">
                        {task.roomName ||
                          `Room #${task.roomId}`}
                      </p>

                      <p className="text-xs text-gray-500">
                        Room #{task.roomId}
                      </p>

                    </td>

                    <td className="px-5 py-4">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                          task.status
                        )}`}
                      >
                        {formatStatus(task.status)}
                      </span>

                    </td>

                    <td className="max-w-md px-5 py-4 text-sm text-gray-600">
                      {task.notes || "—"}
                    </td>

                    <td className="px-5 py-4">

                      <div className="flex flex-wrap gap-2">

                        {task.status === "PENDING" && (
                          <button
                            type="button"
                            disabled={
                              actionId === task.id
                            }
                            onClick={() =>
                              handleStatusChange(
                                task.id,
                                "IN_PROGRESS"
                              )
                            }
                            className="rounded-lg border px-3 py-2 text-xs font-medium hover:bg-gray-100 disabled:opacity-50"
                          >
                            {actionId === task.id
                              ? "Updating..."
                              : "Start"}
                          </button>
                        )}

                        {task.status === "IN_PROGRESS" && (
                          <button
                            type="button"
                            disabled={
                              actionId === task.id
                            }
                            onClick={() =>
                              handleStatusChange(
                                task.id,
                                "COMPLETED"
                              )
                            }
                            className="rounded-lg border px-3 py-2 text-xs font-medium hover:bg-gray-100 disabled:opacity-50"
                          >
                            {actionId === task.id
                              ? "Updating..."
                              : "Complete"}
                          </button>
                        )}

                        {(task.status === "COMPLETED" ||
                          task.status === "CANCELLED") && (
                          <span className="py-2 text-xs text-gray-400">
                            No actions
                          </span>
                        )}

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

            {tasks.length === 0 && (
              <div className="p-10 text-center text-gray-500">
                No housekeeping tasks are currently assigned to you.
              </div>
            )}

          </div>

        </section>

      </div>

    </main>
  )
}

export default EmployeeHousekeeping