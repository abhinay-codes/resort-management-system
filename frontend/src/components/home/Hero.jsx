import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"

function Hero() {
  const navigate = useNavigate()

  return (
    <section className="relative z-10 w-full h-[100vh] min-h-[600px] flex items-center justify-center pt-20">
      {/* Background Image - Using a stable Unsplash image for a luxury resort */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1542314831-c53cd3816002?auto=format&fit=crop&q=80&w=2000')"
        }}
        aria-hidden="true"
      />
      {/* Elegant dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/20" aria-hidden="true" />

      {/* Hero Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 text-center text-white flex flex-col items-center justify-center">
        <span className="text-sm font-semibold tracking-[0.2em] uppercase text-white/90 mb-6 drop-shadow-sm">
          A Place To Slow Down
        </span>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight mb-6 drop-shadow-md">
          Your Escape <br className="hidden sm:block" /> Starts Here
        </h1>
        <p className="text-lg sm:text-xl font-light text-white/90 max-w-2xl mx-auto mb-10 drop-shadow-sm">
          Luxury stays. Unforgettable experiences.
        </p>

        <Button
          onClick={() => navigate("/rooms")}
          className="bg-white text-black hover:bg-white/90 px-8 py-6 text-sm uppercase tracking-widest font-medium rounded-sm transition-all duration-300"
        >
          Explore Rooms
        </Button>
      </div>

      {/* Floating Booking Widget */}
      <div className="absolute bottom-0 left-0 right-0 z-20 translate-y-1/2 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto bg-white/95 backdrop-blur-md rounded-md shadow-2xl p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row items-center gap-4 lg:gap-8 border border-border">
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 divide-y lg:divide-y-0 lg:divide-x divide-border/60">
            {/* Where */}
            <div className="flex flex-col pt-4 lg:pt-0 lg:px-4 first:pt-0 first:px-0">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Where</label>
              <span className="text-sm font-medium text-foreground">Paradise Resort</span>
            </div>

            {/* Check-in */}
            <div className="flex flex-col pt-4 lg:pt-0 lg:px-4">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Check-in</label>
              <button type="button" className="text-left text-sm font-medium text-foreground/60 hover:text-foreground transition-colors">Select date</button>
            </div>

            {/* Check-out */}
            <div className="flex flex-col pt-4 lg:pt-0 lg:px-4">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Check-out</label>
              <button type="button" className="text-left text-sm font-medium text-foreground/60 hover:text-foreground transition-colors">Select date</button>
            </div>

            {/* Guests */}
            <div className="flex flex-col pt-4 lg:pt-0 lg:px-4">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Guests</label>
              <button type="button" className="text-left text-sm font-medium text-foreground/60 hover:text-foreground transition-colors">2 guests</button>
            </div>
          </div>

          <div className="w-full lg:w-auto mt-4 lg:mt-0">
            <Button
              onClick={() => navigate("/booking")}
              className="w-full lg:w-auto px-8 py-6 uppercase tracking-widest text-xs font-semibold rounded-sm bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Search Availability
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
