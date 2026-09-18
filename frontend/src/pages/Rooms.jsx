import { useEffect, useState } from "react"
import { ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { getRooms } from "@/services/roomService"
import RoomCard from "@/components/home/rooms/RoomCard"

function Rooms() {
  const navigate = useNavigate()

  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    async function loadRooms() {
      try {
        setLoading(true)
        setError("")
        const data = await getRooms()

        if (!cancelled) {
          // Deduplicate by name to prevent dumping hundreds of identical physical rooms
          const uniqueRoomsMap = new Map()
          if (Array.isArray(data)) {
            data.forEach(room => {
              if (!uniqueRoomsMap.has(room.name)) {
                uniqueRoomsMap.set(room.name, room)
              }
            })
          }
          setRooms(Array.from(uniqueRoomsMap.values()))
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load rooms:", error)
          setError(error.message || "Unable to load rooms. Please try again.")
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
  }, [])

  return (
    <main className="min-h-screen bg-background pt-24 pb-32">

      {/* HEADER SECTION */}
      <section className="px-6 lg:px-8 max-w-7xl mx-auto mb-20 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-6">
          Explore Paradise
        </p>
        <h1 className="text-5xl sm:text-6xl font-medium tracking-tight text-foreground mb-8">
          Find a room that <br className="hidden sm:block" /> feels like yours.
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground font-light max-w-2xl mx-auto mb-10">
          Discover comfortable spaces, spacious suites, and relaxing stays designed to make your time at Paradise Resort feel effortless and entirely your own.
        </p>
      </section>

      {/* ROOMS LISTING SECTION */}
      <section className="px-6 lg:px-8 max-w-7xl mx-auto">
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="h-[32rem] animate-pulse rounded-sm border border-border bg-muted/50" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="py-24 text-center">
            <h3 className="text-2xl font-medium mb-4">Unable to load rooms</h3>
            <p className="text-muted-foreground font-light">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-8 px-6 py-3 border border-border hover:bg-muted text-sm uppercase tracking-widest font-semibold transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && rooms.length === 0 && (
          <div className="py-24 text-center">
            <h3 className="text-2xl font-medium mb-4">No rooms available</h3>
            <p className="text-muted-foreground font-light">There are currently no rooms available to display.</p>
          </div>
        )}

        {!loading && !error && rooms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </section>

    </main>
  )
}

export default Rooms
