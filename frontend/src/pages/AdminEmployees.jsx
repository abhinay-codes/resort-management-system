import { useEffect, useState } from "react"
import { CheckCircle2, Mail, UserPlus, UsersRound, XCircle } from "lucide-react"

import { getUsers, createEmployee, updateUserEnabled } from "@/services/userService"
import { Button } from "@/components/ui/button"

function AdminEmployees() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function loadUsers() {
    try {
      setLoading(true)
      setError("")
      const data = await getUsers()
      setUsers(Array.isArray(data) ? data : [])
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  async function handleCreateEmployee(event) {
    event.preventDefault()
    try {
      setSaving(true)
      setError("")
      const employee = await createEmployee({ name, email, password })
      setUsers((currentUsers) => [...currentUsers, employee])
      setName("")
      setEmail("")
      setPassword("")
    } catch (error) {
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleEnabled(user) {
    try {
      setError("")
      const updatedUser = await updateUserEnabled(user.id, !user.enabled)
      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === user.id ? updatedUser : currentUser
        )
      )
    } catch (error) {
      setError(error.message)
    }
  }

  const employees = users.filter((user) => user.role === "EMPLOYEE")

  if (loading) {
    return (
      <main className="min-h-screen bg-muted/30">
        <div className="page-container py-16">
          <div className="resort-card p-8">
            <p className="text-muted-foreground">Loading employees...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="page-container py-10 sm:py-14">
        <header className="page-header">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Administration
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Employee Management
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Create staff accounts and control access to resort operations.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2 text-sm font-medium shadow-sm">
            <UsersRound className="size-4 text-primary" />
            {employees.length} employees
          </div>
        </header>

        {error && (
          <div className="mt-6 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
          <section className="resort-card h-fit p-6 sm:p-7">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserPlus className="size-5" />
            </div>
            <h2 className="mt-5 text-xl font-semibold">Create Employee</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Add a new staff account with secure access.
            </p>

            <form onSubmit={handleCreateEmployee} className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  placeholder="Employee name"
                  className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  placeholder="employee@example.com"
                  className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>

              <Button type="submit" disabled={saving} className="min-h-11 w-full rounded-xl">
                {saving ? "Creating..." : "Create Employee"}
              </Button>
            </form>
          </section>

          <section className="resort-card overflow-hidden">
            <div className="border-b border-border/60 p-6 sm:p-7">
              <h2 className="text-xl font-semibold">Staff Accounts</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Enable or disable employee access.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-muted/40">
                  <tr>
                    {["Name", "Email", "Role", "Status", "Action"].map((heading) => (
                      <th key={heading} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {employees.map((user) => (
                    <tr key={user.id} className="border-t border-border/60 transition hover:bg-muted/20">
                      <td className="px-6 py-5 font-medium">{user.name}</td>
                      <td className="px-6 py-5 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-2">
                          <Mail className="size-3.5" />
                          {user.email}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="status-badge bg-primary/10 text-primary">{user.role}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`status-badge ${user.enabled ? "bg-emerald-100 text-emerald-800" : "bg-destructive/10 text-destructive"}`}>
                          {user.enabled ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}
                          {user.enabled ? "ACTIVE" : "DISABLED"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <Button variant="outline" size="sm" onClick={() => handleToggleEnabled(user)}>
                          {user.enabled ? "Disable" : "Enable"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {employees.length === 0 && (
                <div className="p-12 text-center text-sm text-muted-foreground">
                  No employees created yet.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

export default AdminEmployees
