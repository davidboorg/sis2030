'use client'

import { motion } from 'framer-motion'
import { FileText, Package, Calculator, Target, Download } from 'lucide-react'
import Link from 'next/link'

const steps = [
  {
    number: '1',
    icon: FileText,
    title: 'Skapa produkt',
    description: 'Definiera produkten och dess funktionella enhet'
  },
  {
    number: '2',
    icon: Package,
    title: 'Lägg till material och processer',
    description: 'Bygg upp produktens kompletta materialförteckning'
  },
  {
    number: '3',
    icon: Calculator,
    title: 'Kör beräkning',
    description: 'Analysera miljöpåverkan enligt ISO-standarder'
  },
  {
    number: '4',
    icon: Target,
    title: 'Identifiera hotspots',
    description: 'Hitta de största bidragarna till miljöpåverkan'
  },
  {
    number: '5',
    icon: Download,
    title: 'Exportera rapport',
    description: 'Generera professionell dokumentation för granskning'
  }
]

export default function Steps() {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-sis-gray-50 to-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-sis-gray-900 mb-4">
            Så fungerar 2030+ Calculator
          </h2>
          <p className="text-lg text-sis-gray-600 max-w-2xl mx-auto">
            En strukturerad process för tillförlitliga resultat.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full 
                          bg-gradient-to-b from-sis-pomegranate/20 via-sis-pomegranate/40 to-sis-pomegranate/20
                          hidden lg:block" />

          <div className="space-y-8 lg:space-y-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`flex flex-col lg:flex-row items-center gap-8
                           ${index % 2 === 0 ? 'lg:flex-row-reverse' : ''}`}
              >
                {/* Content */}
                <div className={`flex-1 ${index % 2 === 0 ? 'lg:text-right' : ''}`}>
                  <div className={`inline-block ${index % 2 === 0 ? 'lg:ml-auto' : ''}`}>
                    <div className={`flex items-center gap-4 mb-3
                                    ${index % 2 === 0 ? 'lg:flex-row-reverse' : ''}`}>
                      <span className="text-5xl font-bold text-sis-pomegranate/20">
                        {step.number}
                      </span>
                      <h3 className="text-xl font-semibold text-sis-gray-900">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-sis-gray-600 max-w-md">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Icon circle */}
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-white rounded-full shadow-lg 
                                  border-4 border-sis-pomegranate/20 
                                  flex items-center justify-center
                                  group hover:scale-110 transition-transform duration-300">
                    <step.icon className="w-8 h-8 text-sis-pomegranate" />
                  </div>
                </div>

                {/* Spacer for alternating layout */}
                <div className="flex-1 hidden lg:block" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Link
            href="/products/1"
            className="inline-flex items-center gap-2 px-8 py-4 
                       bg-sis-pomegranate
                       text-white font-medium rounded-xl
                       hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-red-700"
          >
            Se exempelberäkning
            <Calculator className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

