function IntroSection() {
  return (
    <section className="bg-background py-24 sm:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row items-center gap-16 lg:gap-24">
        {/* Editorial Text */}
        <div className="flex-1 max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-6">
            More Than A Stay
          </p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-foreground mb-8 leading-tight">
            Designed for moments <br className="hidden sm:block" /> that stay with you.
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground font-light mb-8">
            Escape the noise and embrace tranquility. At Paradise Resort, we blend modern luxury with the breathtaking beauty of untouched nature, curating an environment where every detail caters to your absolute comfort.
          </p>
          <div className="w-16 h-px bg-primary/30" />
        </div>

        {/* Editorial Image */}
        <div className="flex-1 w-full max-w-md relative">
          {/* Subtle offset decorative box */}
          <div className="absolute -inset-4 bg-muted/50 rounded-sm -z-10 translate-x-4 translate-y-4" />
          <img
            src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=1000"
            alt="Luxury resort relaxation"
            className="w-full aspect-[4/5] object-cover rounded-sm shadow-xl"
          />
        </div>
      </div>
    </section>
  )
}

export default IntroSection
