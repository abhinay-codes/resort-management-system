import Hero from "@/components/home/Hero"
import IntroSection from "@/components/home/intro/IntroSection"
import FeaturedRooms from "@/components/home/rooms/FeaturedRooms"
import Amenities from "@/components/home/amenities/Amenities"
import BookingCTA from "@/components/home/BookingCTA"


function Home() {
  return (
    <main className="overflow-hidden">
      <Hero />
      <IntroSection />
      <FeaturedRooms />
      <Amenities />
      <BookingCTA />
    </main>
  )
}


export default Home