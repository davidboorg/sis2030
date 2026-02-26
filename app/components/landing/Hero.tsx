'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Clock, TrendingUp, Shield } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-trace-bg">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 0%, transparent 100%)',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <span className="w-8 h-px bg-sis-pomegranate" />
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-sis-pomegranate">
              Skandiform sparar 176,000 kr/år
            </span>
            <span className="w-8 h-px bg-sis-pomegranate" />
          </motion.div>

          {/* Main heading */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-trace-text mb-6 leading-[0.95]">
            Dina kunders miljökrav
            <br />
            <span className="text-sis-pomegranate italic">besvarade på minuter</span>
          </h1>

          <p className="text-lg sm:text-xl text-trace-text-secondary mb-4 max-w-2xl mx-auto">
            Miljödeklaration som kunderna kräver - klar på 10 minuter istället för 6 veckor.
          </p>

          {/* Subheading */}
          <p className="text-base text-trace-text-muted mb-12 max-w-xl mx-auto leading-relaxed">
            TR/ACE ger svenska tillverkare samma miljödata som storföretagen -
            utan konsultkostnad, utan ISO-expertis, utan krångel.
          </p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/demo"
              className="group px-8 py-4 bg-sis-pomegranate text-white font-medium
                         hover:bg-red-600 transition-all duration-300
                         hover:shadow-lg hover:shadow-sis-pomegranate/20
                         inline-flex items-center justify-center border border-sis-pomegranate"
            >
              Testa gratis - inget konto krävs
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/products/1"
              className="px-8 py-4 text-trace-text font-medium
                         border border-trace-border-light
                         hover:border-sis-pomegranate hover:text-sis-pomegranate
                         transition-all duration-300 inline-flex items-center justify-center"
            >
              Se en färdig analys
            </Link>
          </motion.div>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto"
        >
          {[
            { icon: Clock, label: '10 minuter', sub: 'istället för 6 veckor' },
            { icon: TrendingUp, label: '2,000 kr/mån', sub: 'istället för 200,000 kr' },
            { icon: Shield, label: 'ISO-godkänd', sub: 'redo för upphandling' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-10 h-10 border border-trace-border-light flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5 text-sis-pomegranate" />
              </div>
              <div>
                <div className="text-sm font-medium text-trace-text">{item.label}</div>
                <div className="text-xs text-trace-text-muted">{item.sub}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
