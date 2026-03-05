'use client'

import { motion } from 'framer-motion'
import { BadgeCheck, FileText, TrendingUp, ShieldCheck, Zap, Users } from 'lucide-react'

const benefits = [
  {
    icon: FileText,
    title: 'Vinn upphandlingar',
    description: 'Offentliga upphandlingar kräver allt oftare miljödata. Med TR/ACE har du svaret samma dag.',
  },
  {
    icon: TrendingUp,
    title: 'Spara 176,000 kr/år',
    description: 'En LCA-konsult kostar 200,000 kr per produkt. TR/ACE ger dig obegränsat antal för 2,000 kr/mån.',
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
    <section className="py-24 px-6 bg-trace-surface border-t border-trace-border">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-8 h-px bg-trace-border-light" />
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-trace-text-muted">
              Fördelar
            </span>
            <span className="w-8 h-px bg-trace-border-light" />
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-trace-text mb-4">
            Varför svenska tillverkare väljer <span className="text-sis-pomegranate italic">TR/ACE</span>
          </h2>
          <p className="text-base text-trace-text-muted max-w-2xl mx-auto">
            95% av svenska företag är SME. De har samma miljökrav som storföretagen -
            men inte samma resurser. Tills nu.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-trace-border">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group bg-trace-bg p-8 hover:bg-trace-surface transition-colors duration-300"
            >
              <div className="w-10 h-10 border border-trace-border-light
                              flex items-center justify-center mb-6
                              group-hover:border-sis-pomegranate transition-colors duration-300">
                <benefit.icon className="w-5 h-5 text-sis-pomegranate" />
              </div>
              <h3 className="text-lg font-medium text-trace-text mb-2">
                {benefit.title}
              </h3>
              <p className="text-sm text-trace-text-muted leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
