import { ArrowRight, Sparkles } from "lucide-react"
import { useNavigate } from "react-router-dom"

import heroImage from "@/assets/hero.png"
import { Button } from "@/components/ui/button"


function Hero() {
  const navigate = useNavigate()

  return (
    <section className="relative isolate min-h-[78vh] overflow-hidden sm:min-h-[84vh]">
      {/* Background image */}
      <img
        src={heroImage}
        alt="Paradise Resort"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Layered overlay for readability */}
      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-black/65" />

      {/* Hero content */}
      <div className="relative z-10 mx-auto flex min-h-[78vh] max-w-7xl items-center justify-center px-5 py-20 text-center text-white sm:min-h-[84vh] sm:px-6 sm:py-24">
        <div className="max-w-4xl">
          {/* Eyebrow */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] backdrop-blur-md sm:text-sm">
            <Sparkles className="h-4 w-4" />
            Welcome to Paradise
          </div>

          {/* Heading */}
          <h1 className="text-balance text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            Escape to Paradise
          </h1>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-white/85 sm:mt-7 sm:text-lg sm:leading-8 md:text-xl">
            Relax, unwind, and experience an unforgettable stay surrounded by
            comfort and nature.
          </p>

          {/* CTA */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row">
            <Button
              onClick={() => navigate("/booking")}
              className="min-h-12 w-full rounded-xl px-7 text-base shadow-lg transition-transform duration-300 hover:-translate-y-0.5 sm:w-auto"
            >
              Book Your Stay
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/rooms")}
              className="min-h-12 w-full rounded-xl border-white/40 bg-white/10 px-7 text-base text-white backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-black sm:w-auto"
            >
              Explore Rooms
            </Button>
          </div>

          {/* Trust-style details */}
          <div className="mx-auto mt-10 flex max-w-xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/75">
            <span>Peaceful surroundings</span>
            <span className="hidden sm:inline">•</span>
            <span>Comfortable stays</span>
            <span className="hidden sm:inline">•</span>
            <span>24/7 support</span>
          </div>
        </div>
      </div>
    </section>
  )
}


export default Hero