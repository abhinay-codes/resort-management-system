import {
  useEffect,
  useState,
} from "react"

import {
  useNavigate,
} from "react-router-dom"

import {
  getEmployeeBookings,
  updateEmployeeBookingStatus,
} from "@/services/employeeBookingService"

import {
  employeeCheckInBooking,
} from "@/services/operations/checkInService"

import {
  employeeCheckOutBooking,
} from "@/services/operations/checkOutService"


function EmployeeHome() {

  const navigate =
    useNavigate()


  const [bookings, setBookings] =
    useState([])


  const [loading, setLoading] =
    useState(true)


  const [error, setError] =
    useState("")


  const [search, setSearch] =
    useState("")


  const [statusFilter, setStatusFilter] =
    useState("ALL")


  const [updatingId, setUpdatingId] =
    useState(null)


  /*
   * ==========================================
   * LOAD BOOKINGS
   * ==========================================
   */

  async function loadBookings() {

    try {

      setLoading(true)
      setError("")


      const data =
        await getEmployeeBookings()


      setBookings(
        Array.isArray(data)
          ? data
          : []
      )


    } catch (error) {

      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch bookings."
      )

    } finally {

      setLoading(false)

    }

  }


  useEffect(() => {

    loadBookings()

  }, [])


  /*
   * ==========================================
   * UPDATE BOOKING STATUS
   * ==========================================
   */

  async function handleStatusChange(
    booking,
    newStatus
  ) {

    try {

      setUpdatingId(
        booking.id
      )

      setError("")


      let updatedBooking

      if (newStatus === "CHECKED_IN") {
        updatedBooking =
          await employeeCheckInBooking(
            booking.id
          )
      } else if (newStatus === "CHECKED_OUT") {
        updatedBooking =
          await employeeCheckOutBooking(
            booking.id
          )
      } else {
        updatedBooking =
          await updateEmployeeBookingStatus(
            booking.id,
            newStatus
          )
      }


      setBookings(
        (currentBookings) =>
          currentBookings.map(
            (currentBooking) =>
              currentBooking.id ===
              booking.id
                ? updatedBooking
                : currentBooking
          )
      )


    } catch (error) {

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update booking status."
      )

    } finally {

      setUpdatingId(null)

    }

  }


  /*
   * ==========================================
   * SEARCH + STATUS FILTER
   * ==========================================
   */

  const filteredBookings =
    bookings.filter(
      (booking) => {

        const searchText =
          search
            .toLowerCase()
            .trim()


        const matchesSearch =
          !searchText ||
          booking.guestName
            ?.toLowerCase()
            .includes(searchText) ||
          booking.email
            ?.toLowerCase()
            .includes(searchText) ||
          booking.room?.name
            ?.toLowerCase()
            .includes(searchText)


        const matchesStatus =
          statusFilter === "ALL" ||
          booking.status ===
            statusFilter


        return (
          matchesSearch &&
          matchesStatus
        )

      }
    )


  /*
   * ==========================================
   * STATISTICS
   * ==========================================
   */

  const pendingCount =
    bookings.filter(
      (booking) =>
        booking.status ===
        "PENDING"
    ).length


  const confirmedCount =
    bookings.filter(
      (booking) =>
        booking.status ===
        "CONFIRMED"
    ).length


  const checkedInCount =
    bookings.filter(
      (booking) =>
        booking.status ===
        "CHECKED_IN"
    ).length


  const checkedOutCount =
    bookings.filter(
      (booking) =>
        booking.status ===
        "CHECKED_OUT"
    ).length


  /*
   * ==========================================
   * LOADING
   * ==========================================
   */

  if (loading) {

    return (

      <main className="min-h-screen bg-gray-50 px-6 py-16">

        <div className="mx-auto max-w-7xl">

          <p className="text-gray-600">
            Loading employee dashboard...
          </p>

        </div>

      </main>

    )

  }


  /*
   * ==========================================
   * PAGE
   * ==========================================
   */

  return (

    <main className="min-h-screen bg-gray-50 px-6 py-16">

      <div className="mx-auto max-w-7xl">


        {/* HEADER */}

        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

          <div>

            <p className="text-sm uppercase tracking-[0.3em] text-gray-500">
              Paradise Resort
            </p>


            <h1 className="mt-3 text-4xl font-bold">
              Employee Dashboard
            </h1>


            <p className="mt-3 text-gray-600">
              Manage daily resort bookings and guest operations.
            </p>

          </div>

        </div>


        {/* ERROR */}

        {error && (

          <div
            role="alert"
            className="mt-6 flex flex-col gap-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 sm:flex-row sm:items-center sm:justify-between"
          >

            <p className="text-sm">
              {error}
            </p>


            <button
              type="button"
              onClick={loadBookings}
              className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium hover:bg-red-100"
            >
              Retry
            </button>

          </div>

        )}


        {/* STATISTICS */}

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl bg-white p-6 shadow-sm">

            <p className="text-sm text-gray-500">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold">
              {pendingCount}
            </p>

          </div>


          <div className="rounded-xl bg-white p-6 shadow-sm">

            <p className="text-sm text-gray-500">
              Confirmed
            </p>

            <p className="mt-2 text-3xl font-bold">
              {confirmedCount}
            </p>

          </div>


          <div className="rounded-xl bg-white p-6 shadow-sm">

            <p className="text-sm text-gray-500">
              Checked In
            </p>

            <p className="mt-2 text-3xl font-bold">
              {checkedInCount}
            </p>

          </div>


          <div className="rounded-xl bg-white p-6 shadow-sm">

            <p className="text-sm text-gray-500">
              Checked Out
            </p>

            <p className="mt-2 text-3xl font-bold">
              {checkedOutCount}
            </p>

          </div>

        </div>


        {/* BOOKINGS */}

        <div className="mt-10 min-w-0 rounded-xl bg-white shadow-sm">


          {/* FILTER BAR */}

          <div className="border-b p-6">

            <div className="flex flex-col gap-4 md:flex-row">

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search guest, email or room..."
                className="min-w-0 flex-1 rounded-lg border border-gray-300 p-3 outline-none focus:border-gray-500"
              />


              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="rounded-lg border border-gray-300 p-3 outline-none focus:border-gray-500"
              >

                <option value="ALL">
                  All Statuses
                </option>

                <option value="PENDING">
                  Pending
                </option>

                <option value="CONFIRMED">
                  Confirmed
                </option>

                <option value="CANCELLED">
                  Cancelled
                </option>

                <option value="CHECKED_IN">
                  Checked In
                </option>

                <option value="CHECKED_OUT">
                  Checked Out
                </option>

              </select>

            </div>

          </div>


          {/* BOOKING TABLE */}

          <div className="overflow-x-auto">

            <table className="w-full table-fixed">

              <thead className="border-b bg-gray-50">

                <tr>

                  <th className="w-[21%] px-3 py-4 text-left text-xs font-semibold sm:px-6 sm:text-sm">
                    Guest
                  </th>

                  <th className="w-[14%] px-3 py-4 text-left text-xs font-semibold sm:px-6 sm:text-sm">
                    Room
                  </th>

                  <th className="w-[17%] px-3 py-4 text-left text-xs font-semibold sm:px-6 sm:text-sm">
                    Dates
                  </th>

                  <th className="w-[21%] px-3 py-4 text-left text-xs font-semibold sm:px-6 sm:text-sm">
                    Guests
                  </th>

                  <th className="w-[13%] px-3 py-4 text-left text-xs font-semibold sm:px-6 sm:text-sm">
                    Amount
                  </th>

                  <th className="w-[12%] px-3 py-4 text-left text-xs font-semibold sm:px-6 sm:text-sm">
                    Status
                  </th>

                  <th className="w-[15%] px-3 py-4 text-left text-xs font-semibold sm:px-6 sm:text-sm">
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredBookings.map(
                  (booking) => (

                    <tr
                      key={booking.id}
                      className="border-b last:border-0"
                    >


                      {/* GUEST */}

                      <td className="min-w-0 px-3 py-5 sm:px-6">

                        <p className="font-medium">
                          {booking.guestName}
                        </p>

                        <p className="mt-1 break-all text-xs text-gray-500 sm:text-sm">
                          {booking.email}
                        </p>

                      </td>


                      {/* ROOM */}

                      <td className="min-w-0 px-3 py-5 sm:px-6">

                        <p className="font-medium">
                          {booking.room?.name}
                        </p>

                      </td>


                      {/* DATES */}

                      <td className="break-words px-3 py-5 text-xs sm:px-6 sm:text-sm">

                        <p>
                          {booking.checkIn}
                        </p>

                        <p className="text-gray-500">
                          to {booking.checkOut}
                        </p>

                      </td>


                      {/* GUEST COUNT */}

                      <td className="px-3 py-5 text-sm sm:px-6 sm:text-base">
                        {booking.guests}
                      </td>


                      {/* AMOUNT */}

                      <td className="px-3 py-5 text-sm font-medium sm:px-6 sm:text-base">

                        ₹
                        {Number(
                          booking.totalAmount
                        ).toLocaleString(
                          "en-IN"
                        )}

                      </td>


                      {/* STATUS */}

                      <td className="min-w-0 px-3 py-5 sm:px-6">

                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">

                          {booking.status.replace(
                            "_",
                            " "
                          )}

                        </span>

                      </td>


                      {/* ACTIONS */}

                      <td className="min-w-0 px-3 py-5 sm:px-6">

                        <div className="flex flex-wrap gap-2">


                          {/* VIEW */}

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/bookings/${booking.id}`
                              )
                            }
                            className="rounded-lg border border-gray-300 px-2 py-1.5 text-[11px] font-medium hover:bg-gray-100 sm:px-3 sm:py-2 sm:text-xs"
                          >
                            View
                          </button>


                          {/* PENDING ACTIONS */}

                          {booking.status ===
                            "PENDING" && (

                            <>

                              <button
                                type="button"
                                disabled={
                                  updatingId ===
                                  booking.id
                                }
                                onClick={() =>
                                  handleStatusChange(
                                    booking,
                                    "CONFIRMED"
                                  )
                                }
                                className="rounded-lg border border-gray-300 px-2 py-1.5 text-[11px] font-medium hover:bg-gray-100 disabled:opacity-50 sm:px-3 sm:py-2 sm:text-xs"
                              >
                                Confirm
                              </button>


                              <button
                                type="button"
                                disabled={
                                  updatingId ===
                                  booking.id
                                }
                                onClick={() =>
                                  handleStatusChange(
                                    booking,
                                    "CANCELLED"
                                  )
                                }
                                className="rounded-lg border border-gray-300 px-2 py-1.5 text-[11px] font-medium hover:bg-gray-100 disabled:opacity-50 sm:px-3 sm:py-2 sm:text-xs"
                              >
                                Cancel
                              </button>

                            </>

                          )}


                          {/* CONFIRMED ACTIONS */}

                          {booking.status ===
                            "CONFIRMED" && (

                            <>

                              <button
                                type="button"
                                disabled={
                                  updatingId ===
                                  booking.id
                                }
                                onClick={() =>
                                  handleStatusChange(
                                    booking,
                                    "CHECKED_IN"
                                  )
                                }
                                className="rounded-lg border border-gray-300 px-2 py-1.5 text-[11px] font-medium hover:bg-gray-100 disabled:opacity-50 sm:px-3 sm:py-2 sm:text-xs"
                              >
                                Check In
                              </button>


                              <button
                                type="button"
                                disabled={
                                  updatingId ===
                                  booking.id
                                }
                                onClick={() =>
                                  handleStatusChange(
                                    booking,
                                    "CANCELLED"
                                  )
                                }
                                className="rounded-lg border border-gray-300 px-2 py-1.5 text-[11px] font-medium hover:bg-gray-100 disabled:opacity-50 sm:px-3 sm:py-2 sm:text-xs"
                              >
                                Cancel
                              </button>

                            </>

                          )}


                          {/* CHECKED IN ACTION */}

                          {booking.status ===
                            "CHECKED_IN" && (

                            <button
                              type="button"
                              disabled={
                                updatingId ===
                                booking.id
                              }
                              onClick={() =>
                                handleStatusChange(
                                  booking,
                                  "CHECKED_OUT"
                                )
                              }
                              className="rounded-lg border border-gray-300 px-2 py-1.5 text-[11px] font-medium hover:bg-gray-100 disabled:opacity-50 sm:px-3 sm:py-2 sm:text-xs"
                            >
                              Check Out
                            </button>

                          )}


                          {/* FINAL STATES */}

                          {(booking.status ===
                            "CANCELLED" ||
                            booking.status ===
                              "CHECKED_OUT") && (

                            <span className="py-2 text-xs text-gray-400">
                              No actions
                            </span>

                          )}

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>


            {filteredBookings.length ===
              0 && (

              <div className="p-10 text-center text-gray-500">
                No bookings found.
              </div>

            )}

          </div>

        </div>

      </div>

    </main>

  )

}


export default EmployeeHome