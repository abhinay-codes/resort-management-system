import { useState } from "react"

import {
  getRole,
} from "@/services/authService"

import {
  searchGuest,
  searchEmployeeGuest,
} from "@/services/operations/guestService"


function GuestSearch() {

  const role = getRole()

  const [email, setEmail] = useState("")
  const [guest, setGuest] = useState(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")


  async function handleSearch(event) {

    event.preventDefault()

    const normalizedEmail =
      email.trim()

    if (!normalizedEmail) {
      setError("Enter a guest email.")
      return
    }


    try {

      setLoading(true)
      setError("")
      setGuest(null)


      const data =
        role === "EMPLOYEE"
          ? await searchEmployeeGuest(
              normalizedEmail
            )
          : await searchGuest(
              normalizedEmail
            )


      setGuest(data)

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Failed to search guest."
      )

    } finally {

      setLoading(false)

    }
  }


  function formatStatus(status) {

    if (!status) {
      return "—"
    }

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      )
  }


  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">

      <div className="mx-auto max-w-5xl">

        {/* HEADER */}

        <div className="mb-8">

          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Resort Operations
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Guest Search
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Search guest information using their registered email address.
          </p>

        </div>


        {/* SEARCH FORM */}

        <form
          onSubmit={handleSearch}
          className="rounded-2xl border bg-white p-6 shadow-sm"
        >

          <label
            htmlFor="guest-email"
            className="block text-sm font-medium"
          >
            Guest Email
          </label>


          <div className="mt-2 flex flex-col gap-3 sm:flex-row">

            <input
              id="guest-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="guest@example.com"
              autoComplete="email"
              className="flex-1 rounded-lg border border-gray-300 p-3 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
            />


            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-black px-6 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Searching..."
                : "Search"}
            </button>

          </div>

        </form>


        {/* ERROR */}

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}


        {/* GUEST RESULT */}

        {guest && (

          <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Guest
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  {guest.guestName || "Unknown Guest"}
                </h2>

              </div>

            </div>


            {/* GUEST INFORMATION */}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">

              <div className="rounded-xl bg-gray-50 p-4">

                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Email
                </p>

                <p className="mt-1 break-all font-medium">
                  {guest.email || "—"}
                </p>

              </div>


              <div className="rounded-xl bg-gray-50 p-4">

                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Phone
                </p>

                <p className="mt-1 font-medium">
                  {guest.phone || "—"}
                </p>

              </div>


              <div className="rounded-xl bg-gray-50 p-4">

                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Total Bookings
                </p>

                <p className="mt-1 text-xl font-bold">
                  {guest.bookings?.length || 0}
                </p>

              </div>

            </div>


            {/* BOOKINGS */}

            {guest.bookings?.length > 0 ? (

              <div className="mt-8">

                <div className="mb-4">

                  <h3 className="text-lg font-semibold">
                    Booking History
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Previous and current reservations for this guest.
                  </p>

                </div>


                <div className="overflow-x-auto rounded-xl border">

                  <table className="w-full min-w-[700px]">

                    <thead className="border-b bg-gray-50">

                      <tr>

                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Booking
                        </th>

                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Room
                        </th>

                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Check In
                        </th>

                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Check Out
                        </th>

                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Status
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {guest.bookings.map(
                        (booking) => (

                          <tr
                            key={booking.id}
                            className="border-b last:border-b-0"
                          >

                            <td className="px-4 py-3 font-medium">
                              #{booking.id}
                            </td>


                            <td className="px-4 py-3">
                              {booking.room?.name ||
                                booking.roomName ||
                                `Room ${booking.room?.id ?? "—"}`}
                            </td>


                            <td className="px-4 py-3 text-sm">
                              {booking.checkIn || "—"}
                            </td>


                            <td className="px-4 py-3 text-sm">
                              {booking.checkOut || "—"}
                            </td>


                            <td className="px-4 py-3">

                              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">
                                {formatStatus(
                                  booking.status
                                )}
                              </span>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </div>

            ) : (

              <div className="mt-8 rounded-xl border border-dashed p-8 text-center">

                <p className="font-medium">
                  No bookings found.
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  This guest does not have any booking history.
                </p>

              </div>

            )}

          </section>

        )}

      </div>

    </main>
  )
}


export default GuestSearch