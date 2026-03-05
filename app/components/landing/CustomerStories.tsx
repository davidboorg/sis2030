'use client'

import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'

const stories = [
  {
    quote: 'Vi förlorade en upphandling värd 400,000 kr för att vi inte kunde visa vår klimatpåverkan. Med TR/ACE hade vi haft svaret samma dag.',
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
    quote: 'Vi är underleverantör till Volvo. De ställer krav på klimatdata i hela kedjan. Utan TR/ACE hade vi behövt anställa en hållbarhetskonsult.',
    role: 'Kvalitetschef',
    industry: 'Verkstadsindustri',
    employees: 48,
    result: 'Klarar leverantörsgranskningar utan extern hjälp',
  },
]

export default function CustomerStories() {
  return (
    <section className="py-24 px-6 bg-trace-bg border-t border-trace-border">
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
              Kundberättelser
            </span>
            <span className="w-8 h-px bg-trace-border-light" />
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-trace-text mb-4">
            De hade samma problem som du
          </h2>
          <p className="text-base text-trace-text-muted max-w-2xl mx-auto">
            Svenska tillverkare berättar hur miljödata förändrade deras affär.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-trace-border border border-trace-border">
          {stories.map((story, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="bg-trace-bg p-8 flex flex-col"
            >
              {/* Quote icon */}
              <div className="w-10 h-10 border border-trace-border-light
                              flex items-center justify-center mb-6">
                <Quote className="w-5 h-5 text-sis-pomegranate" />
              </div>

              {/* Quote text */}
              <blockquote className="text-trace-text-secondary leading-relaxed mb-6 flex-1 text-sm">
                &ldquo;{story.quote}&rdquo;
              </blockquote>

              {/* Attribution */}
              <div className="border-t border-trace-border pt-4">
                <div className="font-medium text-trace-text text-sm">
                  {story.role}
                </div>
                <div className="text-xs text-trace-text-muted">
                  {story.industry} &middot; {story.employees} anställda
                </div>
              </div>

              {/* Result badge */}
              <div className="mt-4 bg-pomegranate-dim border border-pomegranate-border px-3 py-2">
                <div className="font-mono text-[9px] tracking-[0.15em] uppercase text-sis-pomegranate mb-1">
                  Resultat
                </div>
                <div className="text-sm text-trace-text">
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
