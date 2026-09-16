import {
  ArrowRight,
  Users,
} from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { roomImages } from "@/data/roomImages"


function RoomCard({ room }) {
  const image = roomImages[room.image]

  const formattedPrice =
    Number(room.price).toLocaleString("en-IN")

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">

      {/* ROOM IMAGE */}
      <Link
        to={`/rooms/${room.id}`}
        className="block overflow-hidden"
      >
        <div className="relative overflow-hidden">
          <img
            src={image}
            alt={room.name}
            className="h-64 w-full object-cover transition duration-700 group-hover:scale-105 sm:h-72"
          />

          {/* Image overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-70" />

          {/* Room status */}
          <div className="absolute left-4 top-4 rounded-full border border-white/25 bg-black/35 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
            Paradise Resort
          </div>
        </div>
      </Link>

      {/* ROOM CONTENT */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">

        <h3 className="break-words text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {room.name}
        </h3>

        <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
          {room.description}
        </p>

        {/* CAPACITY */}
        <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />

          <span>
            Up to {room.guests} guests
          </span>
        </div>

        {/* PRICE + CTA */}
        <div className="mt-auto flex flex-col gap-5 border-t border-border pt-6 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="text-2xl font-bold tracking-tight text-foreground">
              ₹{formattedPrice}
            </p>

            <p className="text-sm text-muted-foreground">
              per night
            </p>
          </div>

          <Link
            to={`/rooms/${room.id}`}
            className="w-full sm:w-auto"
          >
            <Button
              variant="outline"
              className="min-h-11 w-full rounded-xl transition-all duration-300 group-hover:border-primary group-hover:text-primary sm:w-auto"
            >
              View Room
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>

        </div>
      </div>
    </article>
  )
}


export default RoomCard