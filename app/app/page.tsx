import Hero from '@/components/landing/Hero'
import Indicators from '@/components/landing/Indicators'
import Standards from '@/components/landing/Standards'
import Steps from '@/components/landing/Steps'
import Partners from '@/components/landing/Partners'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <Indicators />
      <Standards />
      <Steps />
      <Partners />
      <Footer />
    </main>
  )
}


