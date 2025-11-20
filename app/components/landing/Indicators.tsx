'use client'

import { motion } from 'framer-motion'
import { Cloud, Droplets, Zap, Trees, CloudRain, Waves, Leaf, RefreshCw } from 'lucide-react'

const indicators = [
  {
    icon: Cloud,
    name: 'Klimatpåverkan',
    unit: 'kg CO₂e',
    description: 'Växthusgasutsläpp över produktens livscykel',
    standard: 'ISO 14067',
    color: 'text-red-600',
    bg: 'bg-red-50'
  },
  {
    icon: Droplets,
    name: 'Vattenförbrukning',
    unit: 'liter',
    description: 'Total färskvattenanvändning i produktionen',
    standard: 'ISO 14046',
    color: 'text-blue-600',
    bg: 'bg-blue-50'
  },
  {
    icon: Zap,
    name: 'Energianvändning',
    unit: 'MJ',
    description: 'Kumulativ energiförbrukning från alla källor',
    standard: 'ISO 50001',
    color: 'text-amber-600',
    bg: 'bg-amber-50'
  },
  {
    icon: Trees,
    name: 'Markanvändning',
    unit: 'm²·år',
    description: 'Årlig markanvändning för råmaterial och produktion',
    standard: 'ISO 14055',
    color: 'text-green-600',
    bg: 'bg-green-50'
  },
  {
    icon: CloudRain,
    name: 'Försurning',
    unit: 'mol H⁺-eq',
    description: 'Bidrag till försurning av mark och vatten',
    standard: 'ISO 14040',
    color: 'text-purple-600',
    bg: 'bg-purple-50'
  },
  {
    icon: Waves,
    name: 'Övergödning',
    unit: 'g PO₄³⁻-eq',
    description: 'Näringsämnen som bidrar till övergödning',
    standard: 'ISO 14040',
    color: 'text-teal-600',
    bg: 'bg-teal-50'
  },
  {
    icon: Leaf,
    name: 'Biodiversitet',
    unit: 'index 0-1',
    description: 'Påverkan på biologisk mångfald baserat på markanvändning',
    standard: 'ISO 14055',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50'
  },
  {
    icon: RefreshCw,
    name: 'Cirkularitet',
    unit: '%',
    description: 'Andel återvunnet material och återvinningspotential',
    standard: 'ISO 59004',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50'
  }
]

export default function Indicators() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-sis-gray-900 mb-4">
            Åtta miljöindikatorer
          </h2>
          <p className="text-lg text-sis-gray-600 max-w-2xl mx-auto">
            Omfattande miljöanalys enligt internationella ISO-standarder för komplett 
            förståelse av produktens påverkan på klimat, vatten, biodiversitet och cirkularitet.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {indicators.map((indicator, index) => (
            <motion.div
              key={indicator.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-white rounded-2xl p-6 border border-sis-gray-200
                         hover:shadow-lg transition-all duration-300 hover:border-sis-gray-300"
            >
              <div className="flex items-start gap-4">
                <div className={`${indicator.bg} p-3 rounded-xl
                                group-hover:scale-110 transition-transform duration-300`}>
                  <indicator.icon className={`w-6 h-6 ${indicator.color}`} />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-sis-gray-900 mb-1">
                    {indicator.name}
                  </h3>
                  <p className="text-sm font-medium text-sis-gray-500 mb-1">
                    {indicator.unit}
                  </p>
                  <p className="text-xs text-sis-pomegranate font-medium mb-2">
                    {indicator.standard}
                  </p>
                  <p className="text-sm text-sis-gray-600 leading-relaxed">
                    {indicator.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

