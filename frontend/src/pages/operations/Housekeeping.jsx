import { useEffect, useState } from "react"
import { ClipboardCheck, UserRound, XCircle, Sparkles } from "lucide-react"

import {
  getHousekeepingTasks,
  createHousekeepingTask,
  assignHousekeepingTask,
  cancelHousekeepingTask,
} from "@/services/operations/housekeepingService"
import { getRooms } from "@/services/roomService"
import { getEmployees } from "@/services/operations/staffService"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/PageHeader"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { EmptyState } from "@/components/ui/EmptyState"

function Housekeeping() {
  const [tasks, setTasks] = useState([])
  const [rooms, setRooms] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedRoom, setSelectedRoom] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [notes, setNotes] = useState("")
  const [creating, setCreating] = useState(false)
  const [actionId, setActionId] = useState(null)

  async function loadData() {
    try {
      setLoading(true)
      setError("")
      const [tasksData, roomsData, employeesData] = await Promise.all([
        getHousekeepingTasks(),
        getRooms(),
        getEmployees(),
      ])
      setTasks(Array.isArray(tasksData) ? tasksData : [])
      setRooms(Array.isArray(roomsData) ? roomsData : [])
      setEmployees(Array.isArray(employeesData) ? employeesData : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleCreateTask(event) {
    event.preventDefault()
    if (!selectedRoom || !selectedEmployee) {
      setError("Please select a room and employee.")
      return
    }

    try {
      setCreating(true)
      setError("")
      const task = await createHousekeepingTask(
        Number(selectedRoom),
        Number(selectedEmployee),
        notes
      )
      setTasks((current) => [task, ...current])
      setSelectedRoom("")
      setSelectedEmployee("")
      setNotes("")
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  async function handleAssign(taskId) {
    const employeeId = window.prompt("Enter employee ID (numeric):")
    if (!employeeId) return

    try {
      setActionId(taskId)
      setError("")
      const updatedTask = await assignHousekeepingTask(taskId, Number(employeeId))
      setTasks((current) =>
        current.map((task) => (task.id === taskId ? updatedTask : task))
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setActionId(null)
    }
  }

  async function handleCancel(taskId) {
    if (!window.confirm("Cancel this housekeeping task?")) return

    try {
      setActionId(taskId)
      setError("")
      const updatedTask = await cancelHousekeepingTask(taskId)
      setTasks((current) =>
        current.map((task) => (task.id === taskId ? updatedTask : task))
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setActionId(null)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-7xl animate-pulse space-y-8">
          <div className="h-10 w-64 bg-slate-200 rounded-lg" />
          <div className="h-48 bg-slate-200 rounded-3xl" />
          <div className="h-[500px] bg-slate-200 rounded-3xl" />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          eyebrow="Resort Operations"
          title="Housekeeping Management"
          description="Create, assign, and manage housekeeping tasks globally."
        />

        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Create Task</h2>
              <p className="text-sm text-slate-500">Assign a room and staff member.</p>
            </div>
          </div>

          <form onSubmit={handleCreateTask} className="grid gap-4 lg:grid-cols-4">
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              <option value="">Select room</option>
              {rooms.filter((room) => room.status === "AVAILABLE" || room.status === "CLEANING").map((room) => (
                <option key={room.id} value={room.id}>{room.name} — {room.status}</option>
              ))}
            </select>

            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              <option value="">Select employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>{employee.name}</option>
              ))}
            </select>

            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes (optional)"
              className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />

            <Button type="submit" disabled={creating} className="w-full min-h-[46px]">
              {creating ? "Creating..." : "Create Task"}
            </Button>
          </form>
        </section>

        {tasks.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No housekeeping tasks"
            description="All rooms are clean or no tasks have been created yet."
          />
        ) : (
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5 bg-slate-50/50">
              <h2 className="text-xl font-semibold text-slate-900">Task Queue</h2>
              <p className="mt-1 text-sm text-slate-500">{tasks.length} task(s) in the system.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Room</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Employee</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-5">
                        <p className="font-semibold text-slate-900">{task.roomName}</p>
                        <p className="text-xs text-slate-500 mt-1">Room #{task.roomId}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-2 text-sm text-slate-700">
                          <UserRound className="h-4 w-4 text-slate-400" />
                          {task.employeeName || "Unassigned"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge status={task.status} />
                      </td>
                      <td className="px-6 py-5 max-w-xs text-sm text-slate-600">
                        {task.notes || "—"}
                      </td>
                      <td className="px-6 py-5 text-right">
                        {task.status !== "COMPLETED" && task.status !== "CANCELLED" ? (
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" className="bg-white" disabled={actionId === task.id} onClick={() => handleAssign(task.id)}>
                              Assign
                            </Button>
                            <Button variant="outline" size="sm" className="bg-white text-red-600 border-red-200 hover:bg-red-50" disabled={actionId === task.id} onClick={() => handleCancel(task.id)}>
                              <XCircle className="h-3.5 w-3.5 mr-1.5" />
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">No actions</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

export default Housekeeping
