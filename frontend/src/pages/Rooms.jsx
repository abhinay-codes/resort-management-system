import { useEffect, useState } from "react"
import { ArrowRight, BedDouble, Search, Sparkles } from "lucide-react"
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
          setRooms(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load rooms:", error)

          setError(
            error.message ||
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
  }, [])

  return (
    <main className="min-h-screen overflow-hidden bg-background">
      {/* HERO / INTRO */}
      <section className="relative border-b border-border/60 bg-muted/30">
        <div className="page-container relative py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Sparkles className="size-3.5" />
              Find Your Stay
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Rooms designed for
              <span className="block text-primary">
                a better escape.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              Discover comfortable rooms, spacious suites, and relaxing
              stays designed to make your time at Paradise Resort feel
              effortless.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  document
                    .getElementById("rooms-list")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Explore Rooms
                <ArrowRight className="size-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate("/booking")}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 text-sm font-semibold text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Check Availability
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ROOMS */}
      <section
        id="rooms-list"
        className="section scroll-mt-24"
      >
        <div className="page-container">
          <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
                <BedDouble className="size-4" />
                Our Accommodation
              </div>

              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Choose your perfect stay
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Select a room that fits your group, comfort level, and
                getaway plans.
              </p>
            </div>

            {!loading && !error && rooms.length > 0 && (
              <div className="hidden items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground shadow-sm sm:flex">
                <Search className="size-4" />
                {rooms.length}{" "}
                {rooms.length === 1 ? "room" : "rooms"} available
              </div>
            )}
          </div>

          {/* LOADING */}
          {loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm"
                >
                  <div className="h-64 animate-pulse bg-muted sm:h-72" />

                  <div className="space-y-4 p-5 sm:p-6">
                    <div className="h-6 w-2/3 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />

                    <div className="flex justify-between pt-3">
                      <div className="h-6 w-24 animate-pulse rounded bg-muted" />
                      <div className="h-10 w-28 animate-pulse rounded-xl bg-muted" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="mx-auto max-w-2xl rounded-3xl border border-destructive/20 bg-destructive/5 p-8 text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <Search className="size-5" />
              </div>

              <h3 className="text-lg font-semibold">
                We couldn't load the rooms
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {error}
              </p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Try Again
              </button>
            </div>
          )}

          {/* EMPTY */}
          {!loading && !error && rooms.length === 0 && (
            <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
              <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-muted">
                <BedDouble className="size-6 text-muted-foreground" />
              </div>

              <h3 className="text-xl font-semibold">
                No rooms available
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                There are currently no rooms available to display.
                Please check again later.
              </p>
            </div>
          )}

          {/* ROOMS GRID */}
          {!loading && !error && rooms.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* BOTTOM CTA */}
      {!loading && !error && rooms.length > 0 && (
        <section className="pb-16 sm:pb-20 lg:pb-24">
          <div className="page-container">
            <div className="relative overflow-hidden rounded-3xl bg-foreground px-6 py-10 text-background sm:px-10 sm:py-12">
              <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="max-w-xl">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-background/60">
                    Ready to escape?
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                    Your next stay starts here.
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-background/70 sm:text-base">
                    Pick your room and continue to the booking page.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/booking")}
                  className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-background px-6 text-sm font-semibold text-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background focus-visible:ring-offset-2 focus-visible:ring-offset-foreground"
                >
                  Book Your Stay
                  <ArrowRight className="size-4" />
                </button>
              </div>

              <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-primary/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-32 left-1/3 size-72 rounded-full bg-primary/10 blur-3xl" />
            </div>
          </div>
        </section>
      )}
    </main>
  )
}

export default Rooms