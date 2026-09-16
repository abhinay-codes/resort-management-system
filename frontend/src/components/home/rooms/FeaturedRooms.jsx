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
          console.error(
            "Failed to load rooms:",
            error
          )

          setError(
            "Unable to load our featured rooms right now."
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
  }, [])

  return (
    <section className="section bg-muted/35">
      <div className="page-container">

        {/* Section heading */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary sm:text-sm sm:tracking-[0.3em]">
              Stay With Us
            </p>

            <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Featured Rooms
            </h2>

            <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
              Choose the stay that fits your perfect getaway.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/rooms")}
            className="group inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            View all rooms
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[30rem] animate-pulse rounded-3xl border border-border bg-card shadow-sm"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mt-10 rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
            <p className="text-muted-foreground">
              {error}
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          rooms.length === 0 && (
            <div className="mt-10 rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
              <p className="text-muted-foreground">
                Our rooms are currently unavailable.
              </p>
            </div>
          )}

        {/* Rooms */}
        {!loading &&
          !error &&
          rooms.length > 0 && (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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