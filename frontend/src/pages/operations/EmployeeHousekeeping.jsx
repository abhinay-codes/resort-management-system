import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"

import {
  getMyHousekeepingTasks,
  updateMyHousekeepingTaskStatus,
} from "@/services/operations/housekeepingService"
import { PageHeader } from "@/components/ui/PageHeader"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { EmptyState } from "@/components/ui/EmptyState"
import { Button } from "@/components/ui/button"

function EmployeeHousekeeping() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionId, setActionId] = useState(null)

  async function loadTasks() {
    try {
      setLoading(true)
      setError("")
      const data = await getMyHousekeepingTasks()
      setTasks(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.message || "Failed to load housekeeping tasks.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  async function handleStatusChange(taskId, status) {
    try {
      setActionId(taskId)
      setError("")
      const updatedTask = await updateMyHousekeepingTaskStatus(taskId, status)
      setTasks((current) => current.map((t) => (t.id === taskId ? updatedTask : t)))
    } catch (err) {
      setError(err?.message || "Failed to update housekeeping task.")
    } finally {
      setActionId(null)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-5xl animate-pulse space-y-6">
          <div className="h-10 w-64 bg-slate-200 rounded-lg" />
          <div className="h-64 bg-slate-200 rounded-3xl" />
        </div>
      </main>
    )
  }

  // Group tasks for visual hierarchy: pending/in-progress first, then completed/cancelled.
  const activeTasks = tasks.filter(t => t.status === "PENDING" || t.status === "IN_PROGRESS")
  const inactiveTasks = tasks.filter(t => t.status === "COMPLETED" || t.status === "CANCELLED")

  const renderTaskCard = (task) => (
    <div key={task.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <StatusBadge status={task.status} />
          <span className="text-xs font-medium uppercase text-slate-400">Task #{task.id}</span>
        </div>
        <h3 className="text-xl font-semibold text-slate-900">
          {task.roomName || `Room #${task.roomId}`}
        </h3>
        {task.notes && (
          <p className="mt-2 text-sm text-slate-600 max-w-lg">
            {task.notes}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2 shrink-0 md:w-32">
        {task.status === "PENDING" && (
          <Button disabled={actionId === task.id} onClick={() => handleStatusChange(task.id, "IN_PROGRESS")}>
            {actionId === task.id ? "..." : "Start Task"}
          </Button>
        )}
        {task.status === "IN_PROGRESS" && (
          <Button disabled={actionId === task.id} onClick={() => handleStatusChange(task.id, "COMPLETED")}>
            {actionId === task.id ? "..." : "Complete Task"}
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <PageHeader
          eyebrow="Resort Operations"
          title="My Housekeeping"
          description="View and update housekeeping tasks assigned to you."
        />

        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>
        )}

        {tasks.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="All clear"
            description="No housekeeping tasks are currently assigned to you."
          />
        ) : (
          <div className="space-y-12">
            {activeTasks.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 ml-2">Needs Attention</h2>
                {activeTasks.map(renderTaskCard)}
              </section>
            )}

            {inactiveTasks.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 ml-2">Completed</h2>
                {inactiveTasks.map(renderTaskCard)}
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

export default EmployeeHousekeeping
