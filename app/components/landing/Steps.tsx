'use client'

import { motion } from 'framer-motion'
import { MousePointerClick, Sliders, Download } from 'lucide-react'
import Link from 'next/link'

const steps = [
  {
    number: '1',
    icon: MousePointerClick,
    title: 'Välj din bransch',
    description: 'Möbel, livsmedel, verkstad, bygg eller textil - välj en mall och få en förifylld produkt med typiska material och processer.',
    highlight: '30 sekunder',
  },
  {
    number: '2',
    icon: Sliders,
    title: 'Justera det som avviker',
    description: 'Ändra vikter, material och transporter så det matchar din produkt. AI:n hjälper dig om du kör fast.',
    highlight: '5-10 minuter',
  },
  {
    number: '3',
    icon: Download,
    title: 'Få resultat och bevis',
    description: 'Klimatpåverkan, vattenförbrukning, cirkularitet - allt beräknat. Exportera rapport eller dela ditt hållbarhetsbevis direkt.',
    highlight: 'Direkt',
  },
]

export default function Steps() {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-sis-gray-50 to-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-sis-gray-900 mb-4">
            Tre steg. Tio minuter. Klart.
          </h2>
          <p className="text-lg text-sis-gray-600 max-w-2xl mx-auto">
            Ingen ISO-expertis krävs. Ingen konsult behövs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="relative bg-white rounded-2xl p-8 border border-sis-gray-200
                         hover:shadow-lg transition-all duration-300"
            >
              {/* Step number */}
              <div className="absolute -top-4 left-8">
                <span className="inline-flex items-center justify-center w-8 h-8
                               bg-sis-pomegranate text-white text-sm font-bold rounded-full">
                  {step.number}
                </span>
              </div>

              {/* Icon */}
              <div className="w-14 h-14 bg-sis-pomegranate/10 rounded-xl
                              flex items-center justify-center mb-5 mt-2">
                <step.icon className="w-7 h-7 text-sis-pomegranate" />
              </div>

              <h3 className="text-xl font-semibold text-sis-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-sis-gray-600 leading-relaxed text-sm mb-4">
                {step.description}
              </p>

              {/* Time badge */}
              <span className="inline-flex items-center px-3 py-1 bg-sis-pomegranate/10
                             text-sis-pomegranate text-xs font-semibold rounded-full">
                {step.highlight}
              </span>

              {/* Connector arrow (between cards on desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-5 transform -translate-y-1/2 z-10">
                  <div className="text-sis-gray-300 text-2xl">&rarr;</div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 px-8 py-4
                       bg-sis-pomegranate text-white font-medium rounded-xl
                       hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-red-700"
          >
            Prova nu - helt gratis
            <MousePointerClick className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
