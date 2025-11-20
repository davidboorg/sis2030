'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const benefitsForCompanies = [
  'När verktyg blir intuitiva sänks trösklarna – fler kan fatta bättre beslut',
  'Resultat på sekunder, inte veckor',
  'ISO-kompatibel rapportering',
  'AI-drivet beslutsstöd',
  'Fullständig spårbarhet',
  'Integration med befintliga system'
]

const benefitsForSIS = [
  'Från statiska standarder till digital tillämpning',
  'Nya intäktsströmmar genom licensiering',
  'Stärkt roll i den gröna omställningen',
  'Ökad relevans för medlemsföretag',
  'Skalbar plattform för fler standarder'
]

export default function Benefits() {
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
            Värde för alla parter
          </h2>
          <p className="text-lg text-sis-gray-600 max-w-2xl mx-auto">
            2030+ Calculator skapar konkret nytta för både företag och standardiseringsorgan.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* För företag */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-sis-pomegranate/5 to-transparent 
                       rounded-2xl p-8 border border-sis-pomegranate/10"
          >
            <h3 className="text-2xl font-bold text-sis-gray-900 mb-6">
              För företag
            </h3>
            
            <ul className="space-y-4">
              {benefitsForCompanies.map((benefit, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-sis-pomegranate/20 
                                  flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-sis-pomegranate" />
                  </div>
                  <span className="text-sis-gray-700 leading-relaxed">
                    {benefit}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* För SIS */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-sis-pomegranate/5 to-transparent 
                       rounded-2xl p-8 border border-sis-pomegranate/10"
          >
            <h3 className="text-2xl font-bold text-sis-gray-900 mb-6">
              För SIS
            </h3>
            
            <ul className="space-y-4">
              {benefitsForSIS.map((benefit, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-sis-pomegranate/20 
                                  flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-sis-pomegranate" />
                  </div>
                  <span className="text-sis-gray-700 leading-relaxed">
                    {benefit}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
