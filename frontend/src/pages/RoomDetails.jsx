import { useEffect, useState } from "react"
import { ArrowLeft, ArrowRight, Users, Check, Sparkles } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { getRoomById } from "@/services/roomService"
import { roomImages } from "@/data/roomImages"
import { formatCurrency } from "@/utils/currency"

function RoomDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    async function loadRoom() {
      try {
        setLoading(true)
        setError("")
        const data = await getRoomById(id)
        if (!cancelled) {
          setRoom(data)
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load room:", error)
          setError(error.message || "Unable to load this room.")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadRoom()

    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <main className="min-h-screen bg-background pt-24 pb-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto animate-pulse">
          <div className="h-6 w-32 rounded bg-muted mb-8" />
          <div className="h-[60vh] bg-muted mb-12 rounded-sm" />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16">
            <div className="space-y-6">
              <div className="h-12 w-3/4 rounded bg-muted" />
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-2/3 rounded bg-muted" />
            </div>
            <div className="h-64 rounded bg-muted" />
          </div>
        </div>
      </main>
    )
  }

  if (error || !room) {
    return (
      <main className="min-h-screen bg-background pt-32 pb-32 px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-medium mb-4">Room not found</h1>
          <p className="text-muted-foreground font-light mb-8">{error || "The room you are looking for could not be found."}</p>
          <Button variant="outline" onClick={() => navigate("/rooms")} className="px-8 uppercase tracking-widest text-xs font-semibold">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Rooms
          </Button>
        </div>
      </main>
    )
  }

  const image = roomImages[room.image] || "https://images.unsplash.com/photo-1590490359683-658d3d23f972?auto=format&fit=crop&q=80&w=2000"
  const formattedPrice = formatCurrency(room.price)

  const amenities = [
    "Luxury bedding & linens",
    "Panoramic resort views",
    "24/7 Room service",
    "Premium bath amenities",
    "High-speed Wi-Fi",
    "Daily housekeeping"
  ]

  return (
    <main className="min-h-screen bg-background pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        <button
          type="button"
          onClick={() => navigate("/rooms")}
          className="group flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Rooms
        </button>

        {/* LARGE ROOM PHOTOGRAPHY */}
        <div className="w-full h-[50vh] md:h-[60vh] lg:h-[70vh] mb-16 relative overflow-hidden rounded-sm group">
          <img
            src={image}
            alt={room.name}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-700" />
        </div>

        {/* ROOM INFORMATION PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-16 lg:gap-24">

          {/* Main Details */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">
              <Sparkles className="h-3 w-3" />
              Room Details
            </div>

            <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-foreground mb-8">
              {room.name}
            </h1>

            <div className="flex items-center gap-6 pb-8 mb-8 border-b border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-5 w-5 stroke-[1.5]" />
                <span className="text-sm uppercase tracking-wider font-medium">Up to {room.guests} guests</span>
              </div>
            </div>

            <h3 className="text-lg font-medium mb-4">About this room</h3>
            <p className="text-lg leading-relaxed text-muted-foreground font-light mb-12">
              {room.description}
            </p>

            <h3 className="text-lg font-medium mb-6">Amenities</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mb-12">
              {amenities.map(amenity => (
                <li key={amenity} className="flex items-center gap-3 text-muted-foreground font-light">
                  <Check className="h-4 w-4 text-primary" />
                  {amenity}
                </li>
              ))}
            </ul>
          </div>

          {/* Booking / Action Panel */}
          <div>
            <div className="sticky top-32 p-8 border border-border/60 rounded-sm bg-card shadow-sm">
              <div className="mb-6">
                <p className="text-sm text-muted-foreground font-light uppercase tracking-wider mb-2">Starting from</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-medium tracking-tight">{formattedPrice}</span>
                  <span className="text-muted-foreground font-light mb-1">/ night</span>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={() => navigate(`/booking?room=${room.id}`)}
                  className="w-full py-6 text-sm uppercase tracking-widest font-semibold rounded-sm bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Check Availability
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t border-border/50 text-center">
                <p className="text-xs text-muted-foreground font-light">
                  Free cancellation up to 48 hours before check-in.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}

export default RoomDetails
