'use client'

import { motion } from 'framer-motion'
import { BadgeCheck, FileText, TrendingUp, ShieldCheck, Zap, Users } from 'lucide-react'

const benefits = [
  {
    icon: FileText,
    title: 'Vinn upphandlingar',
    description: 'Offentliga upphandlingar kräver allt oftare miljödata. Med 2030+ har du svaret samma dag.',
  },
  {
    icon: TrendingUp,
    title: 'Spara 176,000 kr/år',
    description: 'En LCA-konsult kostar 200,000 kr per produkt. 2030+ ger dig obegränsat antal för 2,000 kr/mån.',
  },
  {
    icon: Zap,
    title: '10 minuter, inte 6 veckor',
    description: 'Välj branschmall, justera och kör. Resultat direkt - inte efter veckor av väntan.',
  },
  {
    icon: ShieldCheck,
    title: 'Uppfyll CSRD-kraven',
    description: 'CSRD och ESRS ställer krav nedåt i leverantörskedjan. Börja mäta nu - det kostar mer att vänta.',
  },
  {
    icon: BadgeCheck,
    title: 'Hållbarhetsbevis att dela',
    description: 'Få ett verifierat hållbarhetsbevis att bifoga offerter, publicera på hemsidan eller sätta på produkten.',
  },
  {
    icon: Users,
    title: 'Samma verktyg som IKEA',
    description: 'ISO-kompatibel livscykelanalys - samma metodik som storföretagen, anpassad för din verklighet.',
  },
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
          <h2 className="text-3xl sm:text-4xl font-bold text-sis-gray-900 mb-4">
            Varför svenska tillverkare väljer 2030+
          </h2>
          <p className="text-lg text-sis-gray-600 max-w-2xl mx-auto">
            95% av svenska företag är SME. De har samma miljökrav som storföretagen -
            men inte samma resurser. Tills nu.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group bg-white rounded-2xl p-6 border border-sis-gray-200
                         hover:shadow-lg hover:border-sis-pomegranate/20 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-sis-pomegranate/10 rounded-xl
                              flex items-center justify-center mb-4
                              group-hover:scale-110 transition-transform duration-300">
                <benefit.icon className="w-6 h-6 text-sis-pomegranate" />
              </div>
              <h3 className="text-lg font-semibold text-sis-gray-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-sis-gray-600 leading-relaxed text-sm">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
