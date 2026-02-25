import Hero from '@/components/landing/Hero'
import Benefits from '@/components/landing/Benefits'
import Steps from '@/components/landing/Steps'
import Standards from '@/components/landing/Standards'
import ROICalculator from '@/components/landing/ROICalculator'
import SustainabilityBadge from '@/components/landing/SustainabilityBadge'
import CustomerStories from '@/components/landing/CustomerStories'
import Indicators from '@/components/landing/Indicators'
import Partners from '@/components/landing/Partners'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <Benefits />
      <Steps />
      <Standards />
      <ROICalculator />
      <SustainabilityBadge />
      <CustomerStories />
      <Indicators />
      <Partners />
      <Footer />
    </main>
  )
}


