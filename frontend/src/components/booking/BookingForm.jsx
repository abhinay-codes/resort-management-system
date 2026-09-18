import { useEffect, useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { format, addDays, isBefore, startOfDay, parseISO } from "date-fns"
import { DayPicker } from "react-day-picker"
import { ArrowRight, Calendar as CalendarIcon, Check, ChevronLeft, ChevronRight, Users, Loader2, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getRooms, getRoomById, checkRoomAvailability } from "@/services/roomService"
import { createBooking } from "@/services/bookingService"
import { formatCurrency } from "@/utils/currency"

import "react-day-picker/dist/style.css"

function getTodayDate() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function BookingForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const roomId = searchParams.get("room")

  // State
  const [rooms, setRooms] = useState([])
  const [selectedRoom, setSelectedRoom] = useState(null)

  // Date Range (using date-fns / react-day-picker)
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined })
  const [guests, setGuests] = useState(2)

  // Details
  const [guestName, setGuestName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [specialRequest, setSpecialRequest] = useState("")

  // Flow State
  const [step, setStep] = useState(1) // 1: Stay, 2: Details, 3: Success
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [availabilityError, setAvailabilityError] = useState("")

  const [availability, setAvailability] = useState(null)
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [booking, setBooking] = useState(null)

  // Load Rooms
  useEffect(() => {
    let cancelled = false
    async function loadRooms() {
      try {
        const data = await getRooms()
        if (cancelled) return

        const roomList = Array.isArray(data) ? data : []
        // Deduplicate
        const uniqueRoomsMap = new Map()
        roomList.forEach(r => {
          if (!uniqueRoomsMap.has(r.name)) uniqueRoomsMap.set(r.name, r)
        })
        const uniqueRooms = Array.from(uniqueRoomsMap.values())
        setRooms(uniqueRooms)

        if (roomId) {
          const room = await getRoomById(roomId)
          if (cancelled) return
          setSelectedRoom(room)
          setGuests(Math.min(2, room.guests))
        } else if (uniqueRooms.length > 0) {
          setSelectedRoom(uniqueRooms[0])
          setGuests(Math.min(2, uniqueRooms[0].guests))
        }
      } catch (err) {
        if (!cancelled) setError("Unable to load rooms. Please try again.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadRooms()
    return () => { cancelled = true }
  }, [roomId])

  // Computed Check-in / Check-out strings
  const checkInStr = dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : ""
  const checkOutStr = dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : ""

  // Check Availability
  useEffect(() => {
    let cancelled = false
    async function checkAvail() {
      if (!selectedRoom || !checkInStr || !checkOutStr) {
        setAvailability(null)
        setAvailabilityError("")
        return
      }

      try {
        setCheckingAvailability(true)
        setAvailability(null)
        setAvailabilityError("")

        const result = await checkRoomAvailability(selectedRoom.id, checkInStr, checkOutStr)
        if (!cancelled) {
          setAvailability(result.available)
          if (!result.available) {
            setAvailabilityError("This room is not available for these dates.")
          }
        }
      } catch (err) {
        if (!cancelled) {
          setAvailability(null)
          setAvailabilityError("Unable to check room availability.")
        }
      } finally {
        if (!cancelled) setCheckingAvailability(false)
      }
    }
    checkAvail()
    return () => { cancelled = true }
  }, [selectedRoom, checkInStr, checkOutStr])

  const nights = useMemo(() => {
    if (!dateRange.from || !dateRange.to) return 0
    const diff = dateRange.to.getTime() - dateRange.from.getTime()
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)))
  }, [dateRange])

  const total = selectedRoom && nights > 0 ? nights * Number(selectedRoom.price) : 0

  // Proceed to Step 2
  const handleProceedToDetails = () => {
    setError("")
    if (!dateRange.from || !dateRange.to) {
      setError("Please select check-in and check-out dates.")
      return
    }
    if (availability === false) {
      setError("Please select available dates before continuing.")
      return
    }
    if (availability === null) {
      setError("Please wait for availability check.")
      return
    }
    setStep(2)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Submit Booking
  const handleBooking = async () => {
    if (submitting) return
    setError("")

    if (!guestName.trim() || !email.trim() || !phone.trim()) {
      setError("Please fill in all required details.")
      return
    }

    try {
      setSubmitting(true)
      const createdBooking = await createBooking({
        guestName: guestName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        specialRequest: specialRequest.trim(),
        checkIn: checkInStr,
        checkOut: checkOutStr,
        guests,
        roomId: selectedRoom.id,
      })

      setBooking(createdBooking)

      // Navigate straight to Payment
      navigate(`/customer/bookings/${createdBooking.id}`)

    } catch (err) {
      setError(err.message || "Unable to create your booking. Please try again.")
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-light">Preparing your booking experience...</p>
      </div>
    )
  }

  if (error && !selectedRoom) {
    return (
      <div className="py-32 text-center">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto mb-32">

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-4 mb-16">
        <div className={`text-xs font-semibold uppercase tracking-widest ${step >= 1 ? "text-primary" : "text-muted-foreground"}`}>01 Stay</div>
        <div className="w-12 h-px bg-border" />
        <div className={`text-xs font-semibold uppercase tracking-widest ${step >= 2 ? "text-primary" : "text-muted-foreground"}`}>02 Details</div>
        <div className="w-12 h-px bg-border" />
        <div className={`text-xs font-semibold uppercase tracking-widest ${step >= 3 ? "text-primary" : "text-muted-foreground"}`}>03 Payment</div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-destructive/5 border border-destructive/20 text-destructive rounded-sm text-sm text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 lg:gap-24">

        {/* LEFT COLUMN: FORMS */}
        <div>
          {step === 1 && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

              {/* Room Selection */}
              <div>
                <h2 className="text-2xl font-medium mb-6">Select your room</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {rooms.map(room => (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      className={`text-left p-5 border rounded-sm transition-all duration-300 ${
                        selectedRoom?.id === room.id
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border/60 bg-card hover:border-primary/50"
                      }`}
                    >
                      <h3 className="font-medium mb-1">{room.name}</h3>
                      <p className="text-xs text-muted-foreground font-light flex items-center gap-2">
                        <Users className="h-3 w-3" /> Up to {room.guests} guests
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div>
                <h2 className="text-2xl font-medium mb-6">When will you be staying?</h2>
                <div className="border border-border/60 bg-card rounded-sm p-6 overflow-hidden overflow-x-auto flex justify-center shadow-sm">
                  <DayPicker
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    disabled={{ before: new Date() }}
                    numberOfMonths={window.innerWidth > 768 ? 2 : 1}
                    className="premium-calendar"
                    classNames={{
                      day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                      day_today: "font-semibold text-primary",
                    }}
                  />
                </div>

                {checkingAvailability && (
                  <p className="text-sm text-muted-foreground mt-4 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Checking availability...
                  </p>
                )}

                {availabilityError && (
                  <p className="text-sm text-destructive mt-4">{availabilityError}</p>
                )}

                {availability === true && (
                  <p className="text-sm text-green-600 mt-4 flex items-center gap-2 font-medium">
                    <Check className="h-4 w-4" /> Your dates are available.
                  </p>
                )}
              </div>

              {/* Guests */}
              <div>
                <h2 className="text-2xl font-medium mb-6">Who is coming?</h2>
                <div className="flex items-center justify-between p-5 border border-border/60 bg-card rounded-sm shadow-sm max-w-sm">
                  <div>
                    <p className="font-medium">Guests</p>
                    <p className="text-xs text-muted-foreground font-light">Max {selectedRoom?.guests || 2}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
                      disabled={guests <= 1}
                    >
                      -
                    </button>
                    <span className="w-4 text-center font-medium">{guests}</span>
                    <button
                      onClick={() => setGuests(Math.min(selectedRoom?.guests || 2, guests + 1))}
                      className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
                      disabled={guests >= (selectedRoom?.guests || 2)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {step === 2 && (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-500">
              <div>
                <h2 className="text-2xl font-medium mb-6">Your Details</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Full Name</label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={e => setGuestName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full p-4 border border-border/60 bg-card rounded-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full p-4 border border-border/60 bg-card rounded-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full p-4 border border-border/60 bg-card rounded-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Special Requests (Optional)</label>
                    <textarea
                      value={specialRequest}
                      onChange={e => setSpecialRequest(e.target.value)}
                      placeholder="Any preferences or requirements?"
                      rows={4}
                      className="w-full p-4 border border-border/60 bg-card rounded-sm focus:outline-none focus:border-primary transition-colors resize-none"
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="mr-4"
                  >
                    Back to Stay
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: SUMMARY */}
        <div>
          <div className="sticky top-32 border border-border/60 bg-card rounded-sm p-8 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">Booking Summary</h3>

            <div className="space-y-6 pb-6 border-b border-border/50">
              <div>
                <p className="text-xl font-medium mb-1">{selectedRoom?.name}</p>
                <p className="text-sm text-muted-foreground font-light">{guests} {guests === 1 ? 'Guest' : 'Guests'}</p>
              </div>

              {dateRange.from && dateRange.to ? (
                <div>
                  <p className="text-sm font-medium">
                    {format(dateRange.from, "MMM d, yyyy")} &mdash; {format(dateRange.to, "MMM d, yyyy")}
                  </p>
                  <p className="text-xs text-muted-foreground font-light mt-1">{nights} {nights === 1 ? 'Night' : 'Nights'}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground font-light italic">Select dates for your stay</p>
              )}
            </div>

            <div className="pt-6">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-medium">Total</span>
                <span className="text-2xl font-medium tracking-tight">
                  {nights > 0 ? formatCurrency(total) : "—"}
                </span>
              </div>

              {step === 1 && (
                <Button
                  onClick={handleProceedToDetails}
                  className="w-full py-6 uppercase tracking-widest text-xs font-semibold rounded-sm bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={!dateRange.from || !dateRange.to || availability !== true}
                >
                  Continue to Details
                </Button>
              )}

              {step === 2 && (
                <Button
                  onClick={handleBooking}
                  disabled={submitting}
                  className="w-full py-6 uppercase tracking-widest text-xs font-semibold rounded-sm bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm & Pay"}
                </Button>
              )}

              <p className="mt-4 text-xs text-center text-muted-foreground font-light flex items-center justify-center gap-1.5">
                <Info className="h-3 w-3" /> You won't be charged yet
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

export default BookingForm
