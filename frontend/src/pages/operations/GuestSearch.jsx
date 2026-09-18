import { useEffect, useState } from "react"
import { Search, UserCircle2 } from "lucide-react"

import { getRole } from "@/services/authService"
import { searchGuest, searchEmployeeGuest } from "@/services/operations/guestService"
import { PageHeader } from "@/components/ui/PageHeader"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/EmptyState"

function GuestSearch() {
  const role = getRole()

  const [email, setEmail] = useState("")
  const [guest, setGuest] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [hasSearched, setHasSearched] = useState(false)

  async function handleSearch(event) {
    event.preventDefault()

    const normalizedEmail = email.trim()
    if (!normalizedEmail) {
      setError("Enter a guest email.")
      return
    }

    try {
      setLoading(true)
      setError("")
      setGuest(null)
      setHasSearched(true)

      const data = role === "EMPLOYEE"
        ? await searchEmployeeGuest(normalizedEmail)
        : await searchGuest(normalizedEmail)

      setGuest(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search guest.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <PageHeader
          eyebrow="Resort Operations"
          title="Guest Search"
          description="Search guest information using their registered email address."
        />

        <form onSubmit={handleSearch} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm mb-8">
          <label htmlFor="guest-email" className="block text-sm font-medium text-slate-700 mb-2">
            Guest Email Address
          </label>

          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                id="guest-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="guest@example.com"
                autoComplete="email"
                className="w-full rounded-xl border border-slate-200 py-3 pl-12 pr-4 text-base outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>
            <Button type="submit" disabled={loading} size="lg" className="sm:w-32">
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </form>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 mb-8">
            {error}
          </div>
        )}

        {hasSearched && !loading && !error && !guest && (
          <EmptyState
            icon={UserCircle2}
            title="No guest found"
            description="We couldn't find any guest matching that email address."
          />
        )}

        {guest && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Guest Profile</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">{guest.guestName || "Unknown Guest"}</h2>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">Email</p>
                <p className="font-medium text-slate-900 break-all">{guest.email || "—"}</p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">Phone</p>
                <p className="font-medium text-slate-900">{guest.phone || "—"}</p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">Total Bookings</p>
                <p className="font-bold text-slate-900 text-xl">{guest.bookings?.length || 0}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Booking History</h3>
              {guest.bookings?.length > 0 ? (
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="border-b border-slate-100 bg-slate-50/50">
                        <tr>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Booking</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Room</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Dates</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {guest.bookings.map((booking) => (
                          <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-900">#{booking.id}</td>
                            <td className="px-6 py-4 text-slate-600">
                              {booking.room?.name || booking.roomName || `Room ${booking.room?.id ?? "—"}`}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {booking.checkIn} &rarr; {booking.checkOut}
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={booking.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                  This guest does not have any booking history.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default GuestSearch
