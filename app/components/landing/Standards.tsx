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
    <section className="py-24 px-6 bg-trace-surface border-t border-trace-border">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-8 h-px bg-trace-border-light" />
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-trace-text-muted">
              Case study
            </span>
            <span className="w-8 h-px bg-trace-border-light" />
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-trace-text mb-4">
            Verkligt resultat, inte teorier
          </h2>
          <p className="text-base text-trace-text-muted max-w-2xl mx-auto">
            Se hur ett riktigt tillverkningsföretag med 15 anställda använder TR/ACE
            för att konkurrera med storföretagen.
          </p>
        </motion.div>

        {/* Case study card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="border border-trace-border mb-12"
        >
          {/* Header */}
          <div className="bg-sis-pomegranate text-white p-8">
            <div className="flex items-center gap-3 mb-2">
              <Factory className="w-5 h-5" />
              <span className="font-mono text-[10px] tracking-[0.15em] uppercase opacity-70">Case study</span>
            </div>
            <h3 className="font-display text-2xl font-light mb-1">{caseStudy.company}</h3>
            <p className="text-sm opacity-80">{caseStudy.employees} anställda i {caseStudy.location} &middot; {caseStudy.product}</p>
          </div>

          {/* Stats comparison */}
          <div className="p-8 bg-trace-bg">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
              {caseStudy.stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-mono text-[9px] tracking-[0.15em] uppercase text-trace-text-muted mb-3">
                    {stat.label}
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-base text-trace-text-muted line-through">{stat.before}</span>
                    <ArrowRight className="w-4 h-4 text-sis-pomegranate" />
                    <span className="text-lg font-medium text-trace-text">{stat.after}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quote */}
            <blockquote className="border-l-2 border-sis-pomegranate pl-4 py-2">
              <p className="text-trace-text-secondary italic leading-relaxed text-sm">
                &ldquo;{caseStudy.quote}&rdquo;
              </p>
              <footer className="mt-2 text-xs text-trace-text-muted">
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
          <h3 className="font-display text-xl font-light text-trace-text mb-6 text-center">
            Färdiga branschmallar - välj och kör
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-px bg-trace-border border border-trace-border">
            {industries.map((industry) => (
              <div
                key={industry.name}
                className={`p-4 text-center transition-all duration-300
                  ${industry.ready
                    ? 'bg-trace-bg hover:bg-trace-surface cursor-pointer'
                    : 'bg-trace-surface opacity-50'}`}
              >
                <div className="font-medium text-trace-text mb-1 text-sm">{industry.name}</div>
                <div className="text-xs text-trace-text-muted">{industry.example}</div>
                {!industry.ready && (
                  <span className="inline-block mt-2 font-mono text-[9px] tracking-[0.1em] uppercase text-trace-text-muted">
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
