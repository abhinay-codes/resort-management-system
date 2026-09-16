import {
  Headphones,
  Leaf,
  Waves,
  Utensils,
} from "lucide-react"


const amenities = [
  {
    title: "Swimming Pool",
    description:
      "Relax and enjoy our pool surrounded by nature.",
    icon: Waves,
  },
  {
    title: "Restaurant",
    description:
      "Enjoy delicious meals and refreshments during your stay.",
    icon: Utensils,
  },
  {
    title: "Nature & Outdoors",
    description:
      "Explore peaceful outdoor spaces around the resort.",
    icon: Leaf,
  },
  {
    title: "24/7 Support",
    description:
      "Our team is available whenever you need assistance.",
    icon: Headphones,
  },
]


function Amenities() {
  return (
    <section className="section bg-background">
      <div className="page-container">

        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary sm:text-sm sm:tracking-[0.3em]">
            Resort Experience
          </p>

          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Everything You Need
          </h2>

          <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
            Thoughtful amenities designed to make your stay comfortable,
            relaxing, and memorable.
          </p>
        </div>

        {/* Amenities */}
        <div className="mt-10 grid gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4">
          {amenities.map((amenity) => {
            const Icon = amenity.icon

            return (
              <div
                key={amenity.title}
                className="group rounded-3xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                  {amenity.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                  {amenity.description}
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