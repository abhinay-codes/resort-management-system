import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"

function BookingCTA() {
  const navigate = useNavigate()

  return (
    <section className="relative w-full py-32 sm:py-48 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80&w=2000')"
        }}
        aria-hidden="true"
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 text-center flex flex-col items-center justify-center">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white mb-8 drop-shadow-md">
          Your stay begins here.
        </h2>
        <p className="text-lg text-white/80 font-light max-w-xl mx-auto mb-10">
          Reserve your slice of paradise today and discover the true meaning of relaxation.
        </p>

        <Button
          onClick={() => navigate("/rooms")}
          className="bg-white text-black hover:bg-white/90 px-8 py-6 text-sm uppercase tracking-widest font-medium rounded-sm transition-all duration-300 shadow-xl hover:shadow-2xl"
        >
          Explore Rooms
        </Button>
      </div>
    </section>
  )
}

export default BookingCTA
