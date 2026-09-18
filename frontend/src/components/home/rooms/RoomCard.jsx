import { ArrowRight, Users } from "lucide-react"
import { Link } from "react-router-dom"
import { roomImages } from "@/data/roomImages"
import { formatCurrency } from "@/utils/currency"

function RoomCard({ room }) {
  const image = roomImages[room.image]
  const formattedPrice = formatCurrency(room.price)

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-sm border border-border/60 bg-card transition-all duration-500 hover:shadow-xl hover:border-border">

      {/* ROOM IMAGE */}
      <Link
        to={`/rooms/${room.id}`}
        className="block overflow-hidden relative"
      >
        <div className="relative overflow-hidden aspect-[4/3] bg-muted">
          <img
            src={image || "https://images.unsplash.com/photo-1590490359683-658d3d23f972?auto=format&fit=crop&q=80&w=1000"}
            alt={room.name}
            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          {/* Subtle overlay */}
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
        </div>
      </Link>

      {/* ROOM CONTENT */}
      <div className="flex flex-1 flex-col p-6 sm:p-8">

        <h3 className="text-2xl font-medium tracking-tight text-foreground mb-3">
          {room.name}
        </h3>

        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
          <Users className="h-4 w-4 stroke-[1.5]" />
          <span>Up to {room.guests} guests</span>
        </div>

        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground font-light mb-8">
          {room.description}
        </p>

        {/* PRICE + CTA */}
        <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-6">
          <div>
            <p className="text-sm text-muted-foreground font-light mb-1">Starting from</p>
            <p className="text-xl font-medium tracking-tight text-foreground">
              {formattedPrice} <span className="text-sm text-muted-foreground font-light">/ night</span>
            </p>
          </div>

          <Link
            to={`/rooms/${room.id}`}
            className="inline-flex items-center justify-center p-3 rounded-full bg-secondary/50 text-foreground transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground"
          >
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-45" />
          </Link>
        </div>
      </div>
    </article>
  )
}

export default RoomCard
