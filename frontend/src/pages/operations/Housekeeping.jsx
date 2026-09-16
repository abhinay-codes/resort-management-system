import { useEffect, useState } from "react"
import { ClipboardCheck, UserRound, XCircle } from "lucide-react"

import {
  getHousekeepingTasks,
  createHousekeepingTask,
  assignHousekeepingTask,
  cancelHousekeepingTask,
} from "@/services/operations/housekeepingService"
import { getRooms } from "@/services/roomService"
import { getEmployees } from "@/services/operations/staffService"
import { Button } from "@/components/ui/button"

function formatStatus(status) {
  return status?.replaceAll("_", " ") || "UNKNOWN"
}

function getStatusClasses(status) {
  switch (status) {
    case "PENDING":
      return "bg-amber-100 text-amber-800"
    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-800"
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-800"
    case "CANCELLED":
      return "bg-muted text-muted-foreground"
    default:
      return "bg-muted text-foreground"
  }
}

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
    const employeeId = window.prompt("Enter employee ID:")
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
      <main className="min-h-screen bg-muted/30">
        <div className="page-container py-16">
          <div className="resort-card p-8 text-muted-foreground">Loading housekeeping...</div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="page-container py-10 sm:py-14">
        <header className="page-header">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Resort Operations</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Housekeeping</h1>
            <p className="mt-3 text-muted-foreground">Create, assign and manage housekeeping tasks.</p>
          </div>
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ClipboardCheck className="size-5" />
          </div>
        </header>

        {error && (
          <div className="mt-6 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <section className="resort-card mt-8 p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ClipboardCheck className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold">Create Housekeeping Task</h2>
              <p className="text-sm text-muted-foreground">Assign a room and staff member.</p>
            </div>
          </div>

          <form onSubmit={handleCreateTask} className="mt-6 grid gap-4 lg:grid-cols-3">
            <select value={selectedRoom} onChange={(event) => setSelectedRoom(event.target.value)} className="min-h-11 rounded-xl border border-border bg-background px-3 text-sm">
              <option value="">Select room</option>
              {rooms.filter((room) => room.status === "AVAILABLE" || room.status === "CLEANING").map((room) => (
                <option key={room.id} value={room.id}>{room.name} — {room.status}</option>
              ))}
            </select>

            <select value={selectedEmployee} onChange={(event) => setSelectedEmployee(event.target.value)} className="min-h-11 rounded-xl border border-border bg-background px-3 text-sm">
              <option value="">Select employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>{employee.name}</option>
              ))}
            </select>

            <input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Notes (optional)" className="min-h-11 rounded-xl border border-border bg-background px-3 text-sm" />

            <Button type="submit" disabled={creating} className="min-h-11 rounded-xl lg:col-span-3">
              {creating ? "Creating..." : "Create Task"}
            </Button>
          </form>
        </section>

        <section className="resort-card mt-6 overflow-hidden">
          <div className="border-b border-border/60 p-6">
            <h2 className="text-xl font-semibold">Task Queue</h2>
            <p className="mt-1 text-sm text-muted-foreground">{tasks.length} task(s) in the system.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-muted/40">
                <tr>
                  {["Room", "Employee", "Status", "Notes", "Actions"].map((heading) => (
                    <th key={heading} className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-t border-border/60">
                    <td className="px-5 py-4">
                      <p className="font-medium">{task.roomName}</p>
                      <p className="text-xs text-muted-foreground">Room #{task.roomId}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-2 text-sm">
                        <UserRound className="size-3.5 text-muted-foreground" />
                        {task.employeeName || "Unassigned"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`status-badge ${getStatusClasses(task.status)}`}>{formatStatus(task.status)}</span>
                    </td>
                    <td className="max-w-xs px-5 py-4 text-sm text-muted-foreground">{task.notes || "—"}</td>
                    <td className="px-5 py-4">
                      {task.status !== "COMPLETED" && task.status !== "CANCELLED" ? (
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" disabled={actionId === task.id} onClick={() => handleAssign(task.id)}>
                            Assign
                          </Button>
                          <Button variant="outline" size="sm" disabled={actionId === task.id} onClick={() => handleCancel(task.id)}>
                            <XCircle className="size-3.5" />
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No actions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {tasks.length === 0 && (
              <div className="p-12 text-center text-sm text-muted-foreground">No housekeeping tasks found.</div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default Housekeeping
