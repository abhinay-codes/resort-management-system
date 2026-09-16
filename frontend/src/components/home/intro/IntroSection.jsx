import { ArrowDown } from "lucide-react"


function IntroSection() {
  return (
    <section className="section bg-background">
      <div className="page-container">
        <div className="mx-auto max-w-4xl text-center">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary sm:text-sm sm:tracking-[0.3em]">
            About Paradise Resort
          </p>

          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            A place to slow down and reconnect
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Nestled in nature, Paradise Resort offers comfortable stays,
            peaceful surroundings, and everything you need for a memorable
            getaway.
          </p>

          <div className="mx-auto mt-8 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm">
            <ArrowDown className="h-4 w-4" />
          </div>
        </div>
      </div>
    </section>
  )
}


export default IntroSection