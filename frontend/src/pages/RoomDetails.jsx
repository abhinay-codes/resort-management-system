import { useEffect, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  Check,
  ChevronRight,
  Sparkles,
  Users,
} from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { getRoomById } from "@/services/roomService"
import { roomImages } from "@/data/roomImages"

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

          setError(
            error.message ||
              "Unable to load this room."
          )
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
      <main className="min-h-screen bg-background">
        <div className="page-container py-10 sm:py-16">
          <div className="animate-pulse">
            <div className="mb-6 h-4 w-32 rounded bg-muted" />

            <div className="grid overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm md:grid-cols-2">
              <div className="h-[320px] bg-muted sm:h-[460px] md:h-[600px]" />

              <div className="space-y-6 p-6 sm:p-8 lg:p-10">
                <div className="h-4 w-36 rounded bg-muted" />
                <div className="h-10 w-3/4 rounded bg-muted" />
                <div className="space-y-3">
                  <div className="h-4 w-full rounded bg-muted" />
                  <div className="h-4 w-full rounded bg-muted" />
                  <div className="h-4 w-2/3 rounded bg-muted" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="h-24 rounded-2xl bg-muted" />
                  <div className="h-24 rounded-2xl bg-muted" />
                </div>

                <div className="h-6 w-32 rounded bg-muted" />

                <div className="h-12 w-full rounded-xl bg-muted" />
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error || !room) {
    return (
      <main className="min-h-screen bg-background">
        <div className="page-container py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <BedDouble className="size-7" />
            </div>

            <h1 className="mt-6 text-2xl font-semibold sm:text-3xl">
              Room not found
            </h1>

            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
              {error ||
                "The room you are looking for could not be found."}
            </p>

            <Button
              variant="outline"
              onClick={() => navigate("/rooms")}
              className="mt-7 min-h-11"
            >
              <ArrowLeft className="size-4" />
              Back to Rooms
            </Button>
          </div>
        </div>
      </main>
    )
  }

  const image = roomImages[room.image]

  const formattedPrice = Number(room.price).toLocaleString(
    "en-IN"
  )

  const amenities = [
    "Comfortable accommodation",
    "Resort surroundings",
    "Room service support",
    "Relaxing stay experience",
  ]

  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <div className="page-container py-8 sm:py-12 lg:py-16">
        {/* BREADCRUMB / BACK */}
        <button
          type="button"
          onClick={() => navigate("/rooms")}
          className="group mb-6 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          Back to Rooms
        </button>

        {/* MAIN ROOM CARD */}
        <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            {/* IMAGE */}
            <div className="relative min-h-[320px] overflow-hidden sm:min-h-[460px] lg:min-h-[650px]">
              {image ? (
                <img
                  src={image}
                  alt={room.name}
                  className="absolute inset-0 h-full w-full object-cover transition duration-700"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <BedDouble className="size-12 text-muted-foreground" />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-black/20" />

              <div className="absolute left-5 top-5 sm:left-7 sm:top-7">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md">
                  <Sparkles className="size-3.5" />
                  Paradise Resort
                </div>
              </div>

              <div className="absolute bottom-5 left-5 right-5 text-white sm:bottom-7 sm:left-7 sm:right-7">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                  Premium Accommodation
                </p>

                <h1 className="mt-2 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                  {room.name}
                </h1>
              </div>
            </div>

            {/* DETAILS */}
            <div className="flex flex-col p-6 sm:p-8 lg:p-10 xl:p-12">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <BedDouble className="size-4" />
                Your Stay
              </div>

              <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                A comfortable place to slow down.
              </h2>

              <p className="mt-5 text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
                {room.description}
              </p>

              {/* QUICK INFO */}
              <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
                <div className="rounded-2xl border border-border/60 bg-muted/40 p-4 sm:p-5">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Users className="size-4" />
                  </div>

                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Guests
                  </p>

                  <p className="mt-1 text-base font-semibold sm:text-lg">
                    Up to {room.guests}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-muted/40 p-4 sm:p-5">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <BedDouble className="size-4" />
                  </div>

                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Starting From
                  </p>

                  <p className="mt-1 text-base font-semibold sm:text-lg">
                    ₹{formattedPrice}
                  </p>
                </div>
              </div>

              {/* AMENITIES */}
              <div className="mt-8 border-t border-border/60 pt-8">
                <h3 className="text-lg font-semibold">
                  Included with your stay
                </h3>

                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {amenities.map((amenity) => (
                    <li
                      key={amenity}
                      className="flex items-start gap-3 text-sm leading-6 text-muted-foreground"
                    >
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Check className="size-3" />
                      </span>

                      <span>{amenity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* PRICE + CTA */}
              <div className="mt-auto pt-8">
                <div className="mb-5 rounded-2xl border border-primary/15 bg-primary/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                    Room rate
                  </p>

                  <div className="mt-1 flex items-end gap-2">
                    <span className="text-2xl font-semibold">
                      ₹{formattedPrice}
                    </span>

                    <span className="pb-1 text-sm text-muted-foreground">
                      / night
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() =>
                      navigate(
                        `/booking?room=${room.id}`
                      )
                    }
                    className="min-h-12 w-full rounded-xl text-sm font-semibold"
                  >
                    Book This Room
                    <ArrowRight className="size-4" />
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => navigate("/rooms")}
                    className="min-h-12 w-full rounded-xl"
                  >
                    View All Rooms
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LOWER INFORMATION */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Sparkles className="size-4" />
              Paradise Experience
            </div>

            <h2 className="mt-3 text-xl font-semibold">
              Designed around your comfort
            </h2>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Whether you're planning a quiet escape or travelling
              with family, this room gives you a comfortable base
              for enjoying everything Paradise Resort has to offer.
            </p>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Users className="size-4" />
              Need More Space?
            </div>

            <h2 className="mt-3 text-xl font-semibold">
              Explore our other rooms
            </h2>

            <button
              type="button"
              onClick={() => navigate("/rooms")}
              className="group mt-5 inline-flex items-center gap-2 text-sm font-semibold text-foreground transition hover:text-primary"
            >
              Browse all rooms
              <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default RoomDetails