import { useEffect, useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

import { Button } from "@/components/ui/button"

import {
  getRooms,
  getRoomById,
  checkRoomAvailability,
} from "@/services/roomService"

import { createBooking } from "@/services/bookingService"
import {
  createPayment,
  getPaymentByBooking,
} from "@/services/payment/paymentService"

function getTodayDate() {
  const today = new Date()

  const year = today.getFullYear()

  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0")

  const day = String(
    today.getDate()
  ).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function formatPrice(value) {
  return Number(value).toLocaleString("en-IN")
}

function formatDate(value) {
  if (!value) {
    return "—"
  }

  const date = new Date(`${value}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function BookingForm() {
  const navigate = useNavigate()

  const [searchParams] =
    useSearchParams()

  const roomId =
    searchParams.get("room")

  /*
   * ==========================================
   * ROOM STATE
   * ==========================================
   */

  const [rooms, setRooms] =
    useState([])

  const [selectedRoom, setSelectedRoom] =
    useState(null)

  /*
   * ==========================================
   * STAY STATE
   * ==========================================
   */

  const [checkIn, setCheckIn] =
    useState("")

  const [checkOut, setCheckOut] =
    useState("")

  const [guests, setGuests] =
    useState(2)

  /*
   * ==========================================
   * GUEST STATE
   * ==========================================
   */

  const [guestName, setGuestName] =
    useState("")

  const [email, setEmail] =
    useState("")

  const [phone, setPhone] =
    useState("")

  const [specialRequest, setSpecialRequest] =
    useState("")

  /*
   * ==========================================
   * BOOKING STATE
   * ==========================================
   */

  const [booking, setBooking] =
    useState(null)

  const [payment, setPayment] =
    useState(null)

  const [bookingCreated, setBookingCreated] =
    useState(false)

  /*
   * ==========================================
   * PAGE STATE
   * ==========================================
   */

  const [loading, setLoading] =
    useState(true)

  const [submitting, setSubmitting] =
    useState(false)

  const [paymentLoading, setPaymentLoading] =
    useState(false)

  const [error, setError] =
    useState("")

  /*
   * ==========================================
   * AVAILABILITY STATE
   * ==========================================
   */

  const [availability, setAvailability] =
    useState(null)

  const [checkingAvailability, setCheckingAvailability] =
    useState(false)

  /*
   * ==========================================
   * LOAD ROOMS
   * ==========================================
   */

  useEffect(() => {
    let cancelled = false

    async function loadRooms() {
      try {
        setLoading(true)
        setError("")

        const data =
          await getRooms()

        if (cancelled) {
          return
        }

        const roomList =
          Array.isArray(data)
            ? data
            : []

        setRooms(roomList)

        if (roomId) {
          const room =
            await getRoomById(roomId)

          if (cancelled) {
            return
          }

          setSelectedRoom(room)

          setGuests(
            Math.min(
              2,
              room.guests
            )
          )
        } else if (
          roomList.length > 0
        ) {
          setSelectedRoom(
            roomList[0]
          )

          setGuests(
            Math.min(
              2,
              roomList[0].guests
            )
          )
        }
      } catch (error) {
        console.error(
          "Failed to load rooms:",
          error
        )

        if (!cancelled) {
          setError(
            "Unable to load rooms. Please try again."
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadRooms()

    return () => {
      cancelled = true
    }
  }, [roomId])

  /*
   * ==========================================
   * CHECK ROOM AVAILABILITY
   * ==========================================
   */

  useEffect(() => {
    let cancelled = false

    async function checkAvailability() {
      if (
        !selectedRoom ||
        !checkIn ||
        !checkOut
      ) {
        setAvailability(null)
        return
      }

      if (checkOut <= checkIn) {
        setAvailability(null)
        return
      }

      try {
        setCheckingAvailability(true)
        setAvailability(null)
        setError("")

        const result =
          await checkRoomAvailability(
            selectedRoom.id,
            checkIn,
            checkOut
          )

        if (!cancelled) {
          setAvailability(
            result.available
          )
        }
      } catch (error) {
        console.error(
          "Failed to check availability:",
          error
        )

        if (!cancelled) {
          setAvailability(null)

          setError(
            "Unable to check room availability. Please try again."
          )
        }
      } finally {
        if (!cancelled) {
          setCheckingAvailability(false)
        }
      }
    }

    checkAvailability()

    return () => {
      cancelled = true
    }
  }, [
    selectedRoom,
    checkIn,
    checkOut,
  ])

  /*
   * ==========================================
   * CALCULATE NIGHTS
   * ==========================================
   */

  const nights = useMemo(() => {
    if (
      !checkIn ||
      !checkOut
    ) {
      return 0
    }

    const start =
      new Date(
        `${checkIn}T00:00:00`
      )

    const end =
      new Date(
        `${checkOut}T00:00:00`
      )

    const difference =
      end.getTime() -
      start.getTime()

    return Math.max(
      0,
      Math.round(
        difference /
          (1000 * 60 * 60 * 24)
      )
    )
  }, [
    checkIn,
    checkOut,
  ])

  /*
   * ==========================================
   * CALCULATE TOTAL
   * ==========================================
   */

  const total =
    selectedRoom &&
    nights > 0
      ? nights *
        Number(selectedRoom.price)
      : 0

  /*
   * ==========================================
   * ROOM CHANGE
   * ==========================================
   */

  async function handleRoomChange(
    event
  ) {
    const id =
      event.target.value

    try {
      setError("")
      setAvailability(null)

      const room =
        await getRoomById(id)

      setSelectedRoom(room)

      setGuests(
        Math.min(
          guests,
          room.guests
        )
      )
    } catch (error) {
      console.error(
        "Failed to load room:",
        error
      )

      setError(
        "Unable to load the selected room."
      )
    }
  }

  /*
   * ==========================================
   * CREATE BOOKING
   * ==========================================
   *
   * IMPORTANT:
   *
   * Creating the booking does NOT mean
   * the booking is confirmed.
   *
   * New booking:
   *
   * PENDING
   *     ↓
   * PAYMENT REQUIRED
   *     ↓
   * SUCCESSFUL PAYMENT
   *     ↓
   * CONFIRMED
   *
   * ==========================================
   */

  async function handleBooking() {
    if (submitting) {
      return
    }

    setError("")

    if (!guestName.trim()) {
      setError(
        "Please enter your full name."
      )
      return
    }

    if (!email.trim()) {
      setError(
        "Please enter your email address."
      )
      return
    }

    if (!phone.trim()) {
      setError(
        "Please enter your phone number."
      )
      return
    }

    if (!checkIn || !checkOut) {
      setError(
        "Please select check-in and check-out dates."
      )
      return
    }

    if (
      checkIn < getTodayDate()
    ) {
      setError(
        "Check-in cannot be in the past."
      )
      return
    }

    if (checkOut <= checkIn) {
      setError(
        "Check-out must be after check-in."
      )
      return
    }

    if (!selectedRoom) {
      setError(
        "Please select a room."
      )
      return
    }

    if (
      guests < 1 ||
      guests > selectedRoom.guests
    ) {
      setError(
        `This room allows up to ${selectedRoom.guests} guests.`
      )
      return
    }

    if (availability === false) {
      setError(
        "This room is not available for the selected dates."
      )
      return
    }

    if (availability === null) {
      setError(
        "Please wait for the room availability check to complete."
      )
      return
    }

    try {
      setSubmitting(true)

      const createdBooking =
        await createBooking({
          guestName:
            guestName.trim(),

          email:
            email.trim(),

          phone:
            phone.trim(),

          specialRequest:
            specialRequest.trim(),

          checkIn,

          checkOut,

          guests,

          roomId:
            selectedRoom.id,
        })

      console.log(
        "Created pending booking:",
        createdBooking
      )

      setBooking(
        createdBooking
      )

      setBookingCreated(true)

      /*
       * The backend creates a pending
       * payment for a new booking.
       *
       * We load that payment here so
       * the customer can proceed to
       * payment immediately.
       */

      try {
        const existingPayment =
          await getPaymentByBooking(
            createdBooking.id
          )

        setPayment(
          existingPayment
        )
      } catch (paymentError) {
        console.error(
          "Failed to load payment:",
          paymentError
        )

        /*
         * If the payment does not
         * already exist, we create it.
         */

        try {
          const createdPayment =
            await createPayment(
              createdBooking.id
            )

          setPayment(
            createdPayment
          )
        } catch (createPaymentError) {
          console.error(
            "Failed to create payment:",
            createPaymentError
          )

          setError(
            createPaymentError.message ||
              "Booking was created, but payment could not be initialized."
          )
        }
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    } catch (error) {
      console.error(
        "Failed to create booking:",
        error
      )

      setError(
        error.message ||
          "Unable to create your booking. Please try again."
      )
    } finally {
      setSubmitting(false)
    }
  }

  /*
   * ==========================================
   * START PAYMENT
   * ==========================================
   *
   * The actual test-gateway payment
   * processing will be connected to
   * the customer payment endpoint in
   * the next backend block.
   *
   * For now we navigate to the customer's
   * booking page where the PaymentCard
   * handles the payment UI.
   *
   * ==========================================
   */

  function handlePayNow() {
    if (!booking?.id) {
      return
    }

    navigate(
      `/customer/bookings/${booking.id}`
    )
  }

  /*
   * ==========================================
   * BOOK ANOTHER STAY
   * ==========================================
   */

  function handleBookAnother() {
    setBooking(null)
    setPayment(null)
    setBookingCreated(false)

    setCheckIn("")
    setCheckOut("")

    setGuestName("")
    setEmail("")
    setPhone("")
    setSpecialRequest("")

    setAvailability(null)
    setError("")

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  /*
   * ==========================================
   * LOADING
   * ==========================================
   */

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 text-center shadow-lg sm:p-10">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-black" />

        <p className="mt-4 text-sm text-gray-500 sm:text-base">
          Loading booking information...
        </p>
      </div>
    )
  }

  /*
   * ==========================================
   * ROOM LOAD ERROR
   * ==========================================
   */

  if (
    error &&
    !selectedRoom
  ) {
    return (
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 text-center shadow-lg sm:p-10">
        <p className="text-sm text-red-500 sm:text-base">
          {error}
        </p>
      </div>
    )
  }

  if (!selectedRoom) {
    return (
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 text-center shadow-lg sm:p-10">
        <p className="text-sm text-gray-600 sm:text-base">
          No rooms are currently available.
        </p>
      </div>
    )
  }

  /*
   * ==========================================
   * PAYMENT REQUIRED SCREEN
   * ==========================================
   */

  if (
    bookingCreated &&
    booking
  ) {
    const paymentStatus =
      payment?.status ||
      "PENDING"

    const paymentSuccessful =
      paymentStatus === "SUCCESS"

    return (
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-5 shadow-lg sm:p-10">

        {/* HEADER */}

        <div className="text-center">

          <div
            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl sm:h-16 sm:w-16 sm:text-3xl ${
              paymentSuccessful
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {paymentSuccessful
              ? "✓"
              : "₹"}
          </div>

          <h2 className="mt-5 text-2xl font-bold leading-tight sm:mt-6 sm:text-3xl">
            {paymentSuccessful
              ? "Booking Confirmed"
              : "Payment Required"}
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-gray-600 sm:text-base sm:leading-7">
            {paymentSuccessful
              ? "Your payment was successful and your reservation is confirmed."
              : "Your booking has been created successfully. Complete the payment to confirm your reservation."}
          </p>

        </div>

        {/* BOOKING REFERENCE */}

        <div className="mt-6 rounded-2xl border-2 border-dashed p-5 text-center sm:mt-8 sm:p-6">

          <p className="text-xs uppercase tracking-[0.18em] text-gray-500 sm:text-sm">
            Booking Reference
          </p>

          <p className="mt-3 text-2xl font-bold tracking-wide sm:text-3xl">
            #{booking.id}
          </p>

          <p className="mt-3 text-xs text-gray-500 sm:text-sm">
            Keep this reference for future use.
          </p>

        </div>

        {/* BOOKING DETAILS */}

        <div className="mt-5 rounded-xl bg-gray-100 p-5 sm:mt-6 sm:p-6">

          <h3 className="text-lg font-semibold sm:text-xl">
            Booking Details
          </h3>

          <div className="mt-5 space-y-4 text-sm text-gray-700">

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">
                Guest
              </span>

              <strong className="text-right">
                {booking.guestName}
              </strong>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">
                Room
              </span>

              <strong className="text-right">
                {booking.room?.name ||
                  selectedRoom.name}
              </strong>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">
                Check-in
              </span>

              <strong className="text-right">
                {formatDate(
                  booking.checkIn
                )}
              </strong>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">
                Check-out
              </span>

              <strong className="text-right">
                {formatDate(
                  booking.checkOut
                )}
              </strong>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">
                Guests
              </span>

              <strong>
                {booking.guests}
              </strong>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">
                Nights
              </span>

              <strong>
                {nights}
              </strong>
            </div>

          </div>

        </div>

        {/* PAYMENT SUMMARY */}

        <div className="mt-5 rounded-xl border p-5 sm:mt-6 sm:p-6">

          <div className="flex items-center justify-between gap-4">

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Payment Status
              </p>

              <p
                className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                  paymentSuccessful
                    ? "bg-green-100 text-green-700"
                    : paymentStatus === "FAILED"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {paymentStatus}
              </p>
            </div>

            <div className="text-right">

              <p className="text-xs uppercase tracking-wide text-gray-500">
                Amount
              </p>

              <p className="mt-1 text-2xl font-bold">
                ₹
                {formatPrice(
                  payment?.amount ??
                    booking.totalAmount ??
                    total
                )}
              </p>

            </div>

          </div>

        </div>

        {/* ACTION */}

        {!paymentSuccessful && (
          <div className="mt-6">

            {error && (
              <div
                role="alert"
                className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
              >
                {error}
              </div>
            )}

            <Button
              type="button"
              onClick={
                handlePayNow
              }
              disabled={
                paymentLoading
              }
              className="w-full py-5 text-base"
            >
              {paymentLoading
                ? "Opening Payment..."
                : paymentStatus === "FAILED"
                  ? "Retry Payment"
                  : "Pay Now"}
            </Button>

            <p className="mt-3 text-center text-xs leading-5 text-gray-500">
              Your reservation will only be confirmed after successful payment.
            </p>

          </div>
        )}

        {/* SUCCESS */}

        {paymentSuccessful && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5 text-sm leading-6 text-green-800">
            <strong>
              Payment successful.
            </strong>{" "}
            Your reservation is now confirmed.
          </div>
        )}

        {/* BOOK ANOTHER */}

        <Button
          type="button"
          variant={
            paymentSuccessful
              ? "default"
              : "outline"
          }
          onClick={
            handleBookAnother
          }
          className="mt-5 w-full"
        >
          Book Another Stay
        </Button>

      </div>
    )
  }

  /*
   * ==========================================
   * BOOKING FORM
   * ==========================================
   */

  return (
    <div className="mx-auto max-w-4xl rounded-2xl bg-white p-5 shadow-lg sm:p-8">

      <h2 className="text-2xl font-bold">
        Your Stay
      </h2>

      {/* ERROR */}

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700 sm:mt-6"
        >
          {error}
        </div>
      )}

      {/* STAY DETAILS */}

      <div className="mt-6 grid gap-5 md:grid-cols-2">

        <div>
          <label
            htmlFor="check-in"
            className="mb-2 block text-sm font-semibold"
          >
            Check-In
          </label>

          <input
            id="check-in"
            type="date"
            min={getTodayDate()}
            value={checkIn}
            onChange={(event) => {
              setCheckIn(
                event.target.value
              )

              setAvailability(null)
            }}
            className="w-full rounded-lg border border-gray-300 p-3 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
          />
        </div>

        <div>
          <label
            htmlFor="check-out"
            className="mb-2 block text-sm font-semibold"
          >
            Check-Out
          </label>

          <input
            id="check-out"
            type="date"
            min={
              checkIn ||
              getTodayDate()
            }
            value={checkOut}
            onChange={(event) => {
              setCheckOut(
                event.target.value
              )

              setAvailability(null)
            }}
            className="w-full rounded-lg border border-gray-300 p-3 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
          />
        </div>

        <div>
          <label
            htmlFor="guests"
            className="mb-2 block text-sm font-semibold"
          >
            Guests
          </label>

          <input
            id="guests"
            type="number"
            min="1"
            max={
              selectedRoom.guests
            }
            value={guests}
            onChange={(event) =>
              setGuests(
                Number(
                  event.target.value
                )
              )
            }
            className="w-full rounded-lg border border-gray-300 p-3 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
          />

          <p className="mt-2 text-xs text-gray-500">
            Maximum{" "}
            {selectedRoom.guests}{" "}
            guests
          </p>
        </div>

        <div>
          <label
            htmlFor="room-type"
            className="mb-2 block text-sm font-semibold"
          >
            Room Type
          </label>

          <select
            id="room-type"
            value={
              selectedRoom.id
            }
            onChange={
              handleRoomChange
            }
            className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
          >
            {rooms.map(
              (room) => (
                <option
                  key={room.id}
                  value={room.id}
                >
                  {room.name}
                </option>
              )
            )}
          </select>
        </div>

      </div>

      {/* AVAILABILITY */}

      {checkingAvailability && (
        <div
          role="status"
          className="mt-5 rounded-lg bg-gray-100 p-4 text-sm leading-6 text-gray-600 sm:mt-6"
        >
          Checking room availability...
        </div>
      )}

      {!checkingAvailability &&
        availability === true && (
          <div
            role="status"
            className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-700 sm:mt-6"
          >
            ✓ This room is available for your selected dates.
          </div>
        )}

      {!checkingAvailability &&
        availability === false && (
          <div
            role="alert"
            className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700 sm:mt-6"
          >
            ✕ This room is not available for your selected dates.
          </div>
        )}

      {/* GUEST DETAILS */}

      <h2 className="mt-8 text-2xl font-bold sm:mt-10">
        Guest Details
      </h2>

      <div className="mt-5 space-y-5 sm:mt-6 sm:space-y-6">

        <div>
          <label
            htmlFor="guest-name"
            className="mb-2 block text-sm font-semibold"
          >
            Full Name *
          </label>

          <input
            id="guest-name"
            type="text"
            value={guestName}
            onChange={(event) =>
              setGuestName(
                event.target.value
              )
            }
            placeholder="Enter your full name"
            maxLength={100}
            autoComplete="name"
            className="w-full rounded-lg border border-gray-300 p-3 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold"
            >
              Email *
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="you@example.com"
              maxLength={255}
              autoComplete="email"
              className="w-full rounded-lg border border-gray-300 p-3 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-semibold"
            >
              Phone *
            </label>

            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(event) =>
                setPhone(
                  event.target.value
                )
              }
              placeholder="Enter phone number"
              maxLength={20}
              autoComplete="tel"
              className="w-full rounded-lg border border-gray-300 p-3 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
            />
          </div>

        </div>

        <div>
          <label
            htmlFor="special-request"
            className="mb-2 block text-sm font-semibold"
          >
            Special Requests
          </label>

          <textarea
            id="special-request"
            value={specialRequest}
            onChange={(event) =>
              setSpecialRequest(
                event.target.value
              )
            }
            placeholder="Any special requests?"
            maxLength={500}
            rows="4"
            className="w-full resize-y rounded-lg border border-gray-300 p-3 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
          />
        </div>

      </div>

      {/* BOOKING SUMMARY */}

      <div className="mt-8 rounded-xl bg-gray-100 p-5 sm:mt-10 sm:p-6">

        <h3 className="text-xl font-semibold sm:text-2xl">
          Booking Summary
        </h3>

        <div className="mt-4 space-y-3 text-sm sm:text-base">

          <div className="flex items-start justify-between gap-4">
            <span className="text-gray-600">
              Room
            </span>

            <strong className="text-right">
              {selectedRoom.name}
            </strong>
          </div>

          <div className="flex items-start justify-between gap-4">
            <span className="text-gray-600">
              Price per night
            </span>

            <strong className="text-right">
              ₹
              {formatPrice(
                selectedRoom.price
              )}
            </strong>
          </div>

          <div className="flex items-start justify-between gap-4">
            <span className="text-gray-600">
              Nights
            </span>

            <strong>
              {nights}
            </strong>
          </div>

          <div className="border-t pt-4">

            <div className="flex items-start justify-between gap-4">

              <span className="text-lg font-bold sm:text-xl">
                Total
              </span>

              <span className="text-xl font-bold sm:text-2xl">
                ₹
                {formatPrice(
                  total
                )}
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* SUBMIT */}

      <Button
        type="button"
        onClick={
          handleBooking
        }
        disabled={
          checkingAvailability ||
          submitting ||
          availability !== true
        }
        className="mt-6 w-full py-5 text-base sm:mt-8"
      >
        {submitting
          ? "Creating Booking..."
          : checkingAvailability
            ? "Checking Availability..."
            : availability === false
              ? "Room Unavailable"
              : availability === true
                ? "Continue to Payment"
                : "Select Dates to Continue"}
      </Button>

      <p className="mt-3 text-center text-xs leading-5 text-gray-500">
        Your reservation will remain pending until payment is completed.
      </p>

    </div>
  )
}

export default BookingForm