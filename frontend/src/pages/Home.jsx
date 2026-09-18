import Hero from "@/components/home/Hero"
import Amenities from "@/components/home/amenities/Amenities"
import IntroSection from "@/components/home/intro/IntroSection"
import FeaturedRooms from "@/components/home/rooms/FeaturedRooms"
import ExperienceSection from "@/components/home/ExperienceSection"
import BookingCTA from "@/components/home/BookingCTA"

function Home() {
  return (
    <main className="overflow-hidden bg-background">
      <Hero />
      <Amenities /> {/* Trust Strip */}
      <IntroSection />
      <FeaturedRooms />
      <ExperienceSection />
      <BookingCTA />
    </main>
  )
}

export default Home
