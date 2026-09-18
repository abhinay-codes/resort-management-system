import { Sparkles } from "lucide-react"
import BookingForm from "@/components/booking/BookingForm"

function Booking() {
  return (
    <main className="min-h-screen bg-background pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* HEADER */}
        <section className="mb-16 text-center max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-6">
            <Sparkles className="h-3 w-3" />
            Reserve Your Stay
          </div>

          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-foreground mb-6">
            Book your escape.
          </h1>

          <p className="text-lg leading-relaxed text-muted-foreground font-light">
            Choose your dates, configure your stay, and let us take care of the rest. Your sanctuary awaits.
          </p>
        </section>

        {/* FORM */}
        <section>
          <BookingForm />
        </section>

      </div>
    </main>
  )
}

export default Booking
