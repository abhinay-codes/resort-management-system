import { CalendarCheck, ShieldCheck, Sparkles } from "lucide-react"

import BookingForm from "@/components/booking/BookingForm"

function Booking() {
  return (
    <main className="min-h-screen overflow-hidden bg-background">
      {/* HEADER */}
      <section className="border-b border-border/60 bg-muted/30">
        <div className="page-container py-14 sm:py-18 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Sparkles className="size-3.5" />
              Reserve Your Stay
            </div>

            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Book your
              <span className="block text-primary">
                escape.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              Choose your room, select your dates, and tell us a
              little about your stay. We'll take care of the rest.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-5 text-xs font-medium text-muted-foreground sm:text-sm">
              <span className="inline-flex items-center gap-2">
                <CalendarCheck className="size-4 text-primary" />
                Flexible booking
              </span>

              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                Secure reservation
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FORM */}
      <section className="section pt-10 sm:pt-14">
        <div className="page-container">
          <BookingForm />
        </div>
      </section>
    </main>
  )
}

export default Booking