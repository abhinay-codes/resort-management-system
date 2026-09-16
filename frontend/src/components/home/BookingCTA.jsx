import {
  ArrowRight,
  CalendarCheck,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"


function BookingCTA() {
  const navigate = useNavigate()

  return (
    <section className="section bg-background">
      <div className="page-container">

        <div className="relative overflow-hidden rounded-[2rem] bg-primary px-6 py-12 text-primary-foreground shadow-xl sm:px-10 sm:py-16 md:px-16">

          {/* Decorative shapes */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-black/10 blur-2xl" />

          <div className="relative z-10 mx-auto max-w-3xl text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
              <CalendarCheck className="h-5 w-5" />
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.25em] text-primary-foreground/75 sm:text-sm sm:tracking-[0.3em]">
              Your Escape Awaits
            </p>

            <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Ready for your next getaway?
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-7 text-primary-foreground/80 sm:text-lg sm:leading-8">
              Find your perfect room and book your stay at Paradise Resort.
            </p>

            <Button
              onClick={() => navigate("/rooms")}
              className="mt-8 min-h-12 rounded-xl bg-white px-7 text-base text-primary shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/90"
            >
              Check Availability
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

          </div>
        </div>
      </div>
    </section>
  )
}


export default BookingCTA