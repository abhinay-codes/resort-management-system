import { useEffect, useState } from "react"
import { CheckCircle2, Mail, UserPlus, UsersRound, XCircle } from "lucide-react"

import { getUsers, createEmployee, updateUserEnabled } from "@/services/userService"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/PageHeader"

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
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-7xl animate-pulse space-y-8">
          <div className="h-10 w-64 bg-slate-200 rounded-lg" />
          <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
            <div className="h-96 bg-slate-200 rounded-3xl" />
            <div className="h-[500px] bg-slate-200 rounded-3xl" />
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          eyebrow="Administration"
          title="Employee Management"
          description="Create staff accounts and control access to resort operations."
          action={
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm">
              <UsersRound className="h-4 w-4 text-slate-700" />
              {employees.length} employees
            </div>
          }
        />

        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm h-fit">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Create Employee</h2>
                <p className="text-sm text-slate-500">Add a new staff account.</p>
              </div>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  placeholder="Employee name"
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  placeholder="employee@example.com"
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              <Button type="submit" disabled={saving} className="w-full mt-2">
                {saving ? "Creating..." : "Create Employee"}
              </Button>
            </form>
          </section>

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5 bg-slate-50/50">
              <h2 className="text-xl font-semibold text-slate-900">Staff Accounts</h2>
              <p className="mt-1 text-sm text-slate-500">Enable or disable employee access.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Name</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Email</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Role</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-5 font-medium text-slate-900">{user.name}</td>
                      <td className="px-6 py-5 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {user.email}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        {user.enabled ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="h-3.5 w-3.5" /> ACTIVE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 border border-red-200">
                            <XCircle className="h-3.5 w-3.5" /> DISABLED
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Button variant="outline" size="sm" onClick={() => handleToggleEnabled(user)} className="bg-white">
                          {user.enabled ? "Disable" : "Enable"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {employees.length === 0 && (
                <div className="p-16 text-center text-slate-500">
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
