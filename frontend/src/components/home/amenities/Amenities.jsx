import { Waves, UtensilsCrossed, BedDouble, ConciergeBell } from "lucide-react"

const trustItems = [
  {
    title: "Infinity Pool",
    description: "Uninterrupted ocean views",
    icon: Waves,
  },
  {
    title: "Fine Dining",
    description: "Michelin-starred experience",
    icon: UtensilsCrossed,
  },
  {
    title: "Luxury Rooms",
    description: "Curated comfort & style",
    icon: BedDouble,
  },
  {
    title: "24/7 Concierge",
    description: "At your service, always",
    icon: ConciergeBell,
  },
]

function Amenities() {
  return (
    <section className="w-full bg-background border-b border-border/50 pt-60 pb-12 sm:pt-40 sm:pb-16 lg:pt-24 lg:pb-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-4 lg:gap-8">
          {trustItems.map((item) => {
            const Icon = item.icon

            return (
              <div
                key={item.title}
                className="flex flex-col items-center text-center group"
              >
                <div className="mb-4 text-primary/70 transition-colors duration-300 group-hover:text-primary">
                  <Icon className="h-6 w-6 stroke-[1.5]" />
                </div>
                <h3 className="text-sm uppercase tracking-widest font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground font-medium">
                  {item.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Amenities
