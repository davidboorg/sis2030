'use client'

import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'

const stories = [
  {
    quote: 'Vi förlorade en upphandling värd 400,000 kr för att vi inte kunde visa vår klimatpåverkan. Med 2030+ hade vi haft svaret samma dag.',
    role: 'Produktionschef',
    industry: 'Möbeltillverkare',
    employees: 22,
    result: 'Vinner nu 3 av 5 upphandlingar med miljökrav',
  },
  {
    quote: 'Vår största kund krävde plötsligt en miljödeklaration. Konsulten sa 6 veckor och 200,000 kr. Vi hade svaret på en eftermiddag.',
    role: 'VD',
    industry: 'Livsmedelsförpackning',
    employees: 35,
    result: 'Behöll kundrelation värd 2,4 Mkr/år',
  },
  {
    quote: 'Vi är underleverantör till Volvo. De ställer krav på klimatdata i hela kedjan. Utan 2030+ hade vi behövt anställa en hållbarhetskonsult.',
    role: 'Kvalitetschef',
    industry: 'Verkstadsindustri',
    employees: 48,
    result: 'Klarar leverantörsgranskningar utan extern hjälp',
  },
]

export default function CustomerStories() {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-white to-sis-gray-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-sis-gray-900 mb-4">
            De hade samma problem som du
          </h2>
          <p className="text-lg text-sis-gray-600 max-w-2xl mx-auto">
            Svenska tillverkare berättar hur miljödata förändrade deras affär.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 sm:p-8 border border-sis-gray-200
                         hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              {/* Quote icon */}
              <div className="w-10 h-10 bg-sis-pomegranate/10 rounded-lg
                              flex items-center justify-center mb-4">
                <Quote className="w-5 h-5 text-sis-pomegranate" />
              </div>

              {/* Quote text */}
              <blockquote className="text-sis-gray-700 leading-relaxed mb-6 flex-1">
                &ldquo;{story.quote}&rdquo;
              </blockquote>

              {/* Attribution */}
              <div className="border-t border-sis-gray-100 pt-4">
                <div className="font-semibold text-sis-gray-900 text-sm">
                  {story.role}
                </div>
                <div className="text-xs text-sis-gray-500">
                  {story.industry} &middot; {story.employees} anställda
                </div>
              </div>

              {/* Result badge */}
              <div className="mt-4 bg-green-50 rounded-lg px-3 py-2">
                <div className="text-xs font-semibold text-green-800">
                  Resultat:
                </div>
                <div className="text-sm text-green-700">
                  {story.result}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
