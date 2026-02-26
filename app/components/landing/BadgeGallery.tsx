'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

// Seed data for demonstration - in production these would be real certificates
const seedBadges = [
  {
    id: '1',
    product: 'Kontorsstol Ergo Pro',
    company: 'Skandiform AB',
    location: 'Tibro',
    co2e: 12.4,
    verified: true,
  },
  {
    id: '2',
    product: 'Konferensbord Flex',
    company: 'M\u00f6belfabriken',
    location: 'Lammhult',
    co2e: 34.2,
    verified: true,
  },
  {
    id: '3',
    product: 'CNC-bearbetad axel',
    company: 'Precision Tech',
    location: 'Eskilstuna',
    co2e: 8.7,
    verified: true,
  },
  {
    id: '4',
    product: 'F\u00f6rpackningsl\u00f6sning',
    company: 'Nordic Pack',
    location: 'Malm\u00f6',
    co2e: 2.1,
    verified: true,
  },
]

export default function BadgeGallery() {
  return (
    <section className="py-24 bg-trace-void border-t border-trace-border">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-16">
          <div className="font-mono text-[10px] tracking-[0.2em] text-trace-gold uppercase mb-4 flex items-center gap-3">
            <span className="w-6 h-px bg-trace-gold" />
            Social Proof
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-light text-trace-parchment tracking-tight mb-4">
            F\u00f6retag som redan visar<br />
            sin klimatp\u00e5verkan<span className="text-trace-gold">.</span>
          </h2>
          <p className="text-trace-parchment/60 max-w-xl">
            Varje badge \u00e4r en screening-LCA enligt ISO 14040/14044-metodiken. Klicka f\u00f6r att se hela certifikatet.
          </p>
        </div>

        {/* Badge Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-trace-border">
          {seedBadges.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link
                href={`/certificate/${badge.id}`}
                className="block bg-trace-surface p-6 hover:bg-trace-surface-2 transition-colors group relative"
              >
                {/* Gold accent on hover */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-trace-gold opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Level indicator */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-trace-verified rounded-full shadow-[0_0_6px_#7EE8A2]" />
                  <span className="font-mono text-[9px] tracking-[0.1em] text-trace-verified uppercase">
                    Nivå 1 · Screening-LCA
                  </span>
                </div>

                {/* Product */}
                <h3 className="font-display text-lg font-light text-trace-parchment mb-1 group-hover:text-trace-gold transition-colors">
                  {badge.product}
                </h3>
                <p className="font-mono text-xs text-trace-parchment/50 mb-6">
                  {badge.company} \u00b7 {badge.location}
                </p>

                {/* CO2e metric */}
                <div className="border-t border-trace-border pt-4">
                  <div className="font-mono text-[9px] tracking-[0.1em] text-trace-parchment/40 uppercase mb-1">
                    Klimatp\u00e5verkan
                  </div>
                  <div className="font-mono text-2xl text-trace-parchment">
                    {badge.co2e.toFixed(1)}
                    <span className="text-sm text-trace-parchment/50 ml-1">kg CO\u2082e</span>
                  </div>
                </div>

                {/* View link */}
                <div className="mt-4 font-mono text-xs text-trace-parchment/30 group-hover:text-trace-gold transition-colors flex items-center gap-2">
                  Se certifikat
                  <span className="group-hover:translate-x-1 transition-transform">\u2192</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="font-mono text-sm text-trace-parchment/50 mb-6">
            Vill du att ditt f\u00f6retag ska synas h\u00e4r?
          </p>
          <Link
            href="/demo"
            className="inline-flex items-center gap-3 px-8 py-4 bg-trace-parchment text-trace-void
                       font-mono text-sm tracking-wide uppercase hover:bg-trace-gold transition-colors"
          >
            Skapa din f\u00f6rsta analys
            <span>\u2192</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
