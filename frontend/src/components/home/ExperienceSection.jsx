function ExperienceSection() {
  return (
    <section className="bg-muted/30 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          <div className="order-2 lg:order-1 grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800"
              alt="Luxury Spa"
              className="w-full aspect-[3/4] object-cover rounded-sm shadow-md mt-8"
            />
            <img
              src="https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&q=80&w=800"
              alt="Fine Dining"
              className="w-full aspect-[3/4] object-cover rounded-sm shadow-md"
            />
          </div>

          <div className="order-1 lg:order-2 max-w-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-6">
              The Art of Slowing Down
            </p>
            <h2 className="text-4xl sm:text-5xl font-medium tracking-tight text-foreground mb-8 leading-tight">
              Experiences curated for the soul.
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground font-light mb-10">
              Whether you're lounging by our infinity pools, enjoying world-class cuisine crafted by our master chefs, or reconnecting with nature on our private trails, every moment here is designed to rejuvenate your spirit.
            </p>

            <ul className="space-y-4 mb-8">
              {['Award-winning wellness spa', 'Private beach access', 'Curated local excursions'].map(item => (
                <li key={item} className="flex items-center gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-base text-foreground font-light">{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  )
}

export default ExperienceSection

