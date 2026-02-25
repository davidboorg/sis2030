'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function Partners() {
  return (
    <section className="py-20 px-6 bg-sis-gray-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          {/* Partner logos */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 mb-12">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-sis-pomegranate rounded-lg
                              flex items-center justify-center">
                <span className="text-white font-bold text-lg">SIS</span>
              </div>
              <span className="text-xl font-semibold text-sis-gray-900">
                Svenska institutet för standarder
              </span>
            </div>

            <div className="hidden md:block w-px h-12 bg-sis-gray-300" />

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-sis-gray-700 rounded-lg
                              flex items-center justify-center">
                <span className="text-white font-bold text-lg">SV</span>
              </div>
              <span className="text-xl font-semibold text-sis-gray-900">
                Surprise Ventures
              </span>
            </div>
          </div>

          <p className="text-sis-gray-600 max-w-2xl mx-auto leading-relaxed mb-12">
            Utvecklat av SIS och Surprise Ventures. Samma organisation som sätter
            standarderna ger dig nu verktyget att uppfylla dem.
          </p>

          {/* Final CTA */}
          <div className="bg-white rounded-2xl border border-sis-gray-200 p-8 sm:p-12 max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold text-sis-gray-900 mb-4">
              Redo att svara på kundernas miljökrav?
            </h3>
            <p className="text-sis-gray-600 mb-8 max-w-lg mx-auto">
              Det tar 10 sekunder att se vad 2030+ kan göra för din produkt.
              Inget konto, inget kreditkort, inget krångel.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/demo"
                className="group px-8 py-4 bg-sis-pomegranate text-white font-medium
                           rounded-xl hover:bg-red-700 transition-all duration-300
                           hover:shadow-xl hover:scale-105 inline-flex items-center justify-center"
              >
                Testa gratis nu
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-white text-sis-gray-700 font-medium
                           rounded-xl border-2 border-sis-gray-300
                           hover:border-sis-pomegranate hover:text-sis-pomegranate
                           transition-all duration-300 inline-flex items-center justify-center"
              >
                Logga in
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
