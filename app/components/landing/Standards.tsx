'use client'

import { motion } from 'framer-motion'
import { Factory, ArrowRight } from 'lucide-react'

const caseStudy = {
  company: 'Skandiform AB',
  location: 'Tibro',
  employees: 15,
  product: 'Kontorsstol Ergo Pro',
  stats: [
    { label: 'Konsultkostnad per år', before: '200,000 kr', after: '24,000 kr' },
    { label: 'Tid per analys', before: '6 veckor', after: '10 minuter' },
    { label: 'Produkter analyserade', before: '1 per år', after: 'Obegränsat' },
  ],
  quote: 'Vi kunde aldrig motivera 200,000 kr för en LCA. Nu har vi miljödata på alla våra produkter och vinner upphandlingar vi tidigare inte ens sökte.',
}

const industries = [
  { name: 'Möbel', example: 'Kontorsstol, bokhylla, soffa', ready: true },
  { name: 'Livsmedel', example: 'Förpackat livsmedel, dryck', ready: true },
  { name: 'Verkstad', example: 'Bearbetad detalj, plåtprodukt', ready: true },
  { name: 'Bygg', example: 'Byggelement, isolering, fönster', ready: false },
  { name: 'Textil', example: 'Plagg, tyg, hemtextil', ready: false },
]

export default function Standards() {
  return (
    <section className="py-20 px-6 bg-sis-gray-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-sis-gray-900 mb-4">
            Verkligt resultat, inte teorier
          </h2>
          <p className="text-lg text-sis-gray-600 max-w-2xl mx-auto">
            Se hur ett riktigt tillverkningsföretag med 15 anställda använder 2030+
            för att konkurrera med storföretagen.
          </p>
        </motion.div>

        {/* Case study card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl border border-sis-gray-200 overflow-hidden mb-12"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-sis-pomegranate to-red-700 text-white p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-2">
              <Factory className="w-6 h-6" />
              <span className="text-sm font-medium opacity-80">Case study</span>
            </div>
            <h3 className="text-2xl font-bold mb-1">{caseStudy.company}</h3>
            <p className="opacity-80">{caseStudy.employees} anställda i {caseStudy.location} &middot; {caseStudy.product}</p>
          </div>

          {/* Stats comparison */}
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              {caseStudy.stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-xs font-medium text-sis-gray-500 uppercase tracking-wide mb-3">
                    {stat.label}
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-lg text-sis-gray-400 line-through">{stat.before}</span>
                    <ArrowRight className="w-4 h-4 text-sis-pomegranate" />
                    <span className="text-xl font-bold text-sis-gray-900">{stat.after}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quote */}
            <blockquote className="border-l-4 border-sis-pomegranate pl-4 py-2">
              <p className="text-sis-gray-700 italic leading-relaxed">
                &ldquo;{caseStudy.quote}&rdquo;
              </p>
              <footer className="mt-2 text-sm text-sis-gray-500">
                &mdash; Produktionschef, {caseStudy.company}
              </footer>
            </blockquote>
          </div>
        </motion.div>

        {/* Industry templates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h3 className="text-xl font-bold text-sis-gray-900 mb-4 text-center">
            Färdiga branschmallar - välj och kör
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {industries.map((industry) => (
              <div
                key={industry.name}
                className={`rounded-xl p-4 text-center border transition-all duration-300
                  ${industry.ready
                    ? 'bg-white border-sis-gray-200 hover:border-sis-pomegranate/40 hover:shadow-md cursor-pointer'
                    : 'bg-sis-gray-50 border-sis-gray-100 opacity-60'}`}
              >
                <div className="font-semibold text-sis-gray-900 mb-1">{industry.name}</div>
                <div className="text-xs text-sis-gray-500">{industry.example}</div>
                {!industry.ready && (
                  <span className="inline-block mt-2 text-xs text-sis-gray-400 bg-sis-gray-100 px-2 py-0.5 rounded-full">
                    Kommer snart
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
