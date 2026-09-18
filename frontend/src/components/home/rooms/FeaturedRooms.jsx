import { ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { getRooms } from "@/services/roomService"

import RoomCard from "./RoomCard"

function FeaturedRooms() {
  const navigate = useNavigate()

  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    async function loadRooms() {
      try {
        setError("")
        const data = await getRooms()

        if (!cancelled) {
          setRooms(
            Array.isArray(data)
              ? data.slice(0, 3)
              : []
          )
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load rooms:", error)
          setError("Unable to load our featured rooms right now.")
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
    <section className="bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Section heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-foreground">
              Your Sanctuary Awaits
            </h2>
            <p className="mt-4 text-lg text-muted-foreground font-light">
              Discover our thoughtfully designed spaces, crafted for comfort, elegance, and uninterrupted relaxation.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/rooms")}
            className="group inline-flex w-fit items-center gap-2 text-sm uppercase tracking-widest font-semibold text-primary transition-colors hover:text-primary/80"
          >
            View all rooms
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[32rem] animate-pulse rounded-sm border border-border bg-muted/50"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mt-10 border-t border-border bg-card py-16 text-center">
            <p className="text-muted-foreground font-light text-lg">
              {error}
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && rooms.length === 0 && (
          <div className="mt-10 border-t border-border bg-card py-16 text-center">
            <p className="text-muted-foreground font-light text-lg">
              Our rooms are currently unavailable.
            </p>
          </div>
        )}

        {/* Rooms */}
        {!loading && !error && rooms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default FeaturedRooms
