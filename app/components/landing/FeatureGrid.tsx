'use client'

import { motion } from 'framer-motion'
import { Package, Brain, BarChart3, TrendingDown } from 'lucide-react'

const features = [
  {
    icon: Package,
    title: 'Bygg din produkt',
    description: 'Lägg till komponenter, material och processer i en intuitiv trädstruktur.',
    color: 'blue'
  },
  {
    icon: Brain,
    title: 'AI-stöd',
    description: 'Fyller i saknad data med kvalitetssäkrade uppskattningar från validerade källor.',
    color: 'purple'
  },
  {
    icon: BarChart3,
    title: 'Analysera påverkan',
    description: 'Sex miljöindikatorer enligt ISO 14040-serien för komplett miljöprofil.',
    color: 'green'
  },
  {
    icon: TrendingDown,
    title: 'Förbättra',
    description: 'Få konkreta förslag för att minska klimatpåverkan med kvantifierade effekter.',
    color: 'orange'
  }
]

const colorClasses = {
  blue: 'bg-sis-pomegranate/10 text-sis-pomegranate',
  purple: 'bg-sis-pomegranate/10 text-sis-pomegranate',
  green: 'bg-sis-pomegranate/10 text-sis-pomegranate',
  orange: 'bg-sis-pomegranate/10 text-sis-pomegranate'
}

export default function FeatureGrid() {
  return (
    <section className="py-20 px-6 bg-sis-gray-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-sis-gray-900 mb-4">
            Från standard till handling.
          </h2>
          <p className="text-lg text-sis-gray-600 max-w-2xl mx-auto">
            Fyra enkla steg för att förstå och förbättra dina produkters miljöpåverkan.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300
                         border border-sis-gray-200/50 hover:border-sis-gray-300/50
                         group hover:-translate-y-1"
            >
              <div className={`w-14 h-14 rounded-xl ${colorClasses[feature.color]} 
                              flex items-center justify-center mb-4
                              group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7" />
              </div>
              
              <h3 className="text-xl font-semibold text-sis-gray-900 mb-3">
                {feature.title}
              </h3>
              
              <p className="text-sis-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

