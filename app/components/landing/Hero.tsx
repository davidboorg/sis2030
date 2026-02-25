'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, TrendingUp, Clock, Shield } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-sis-pomegranate/5 via-transparent to-white" />

      {/* Circular economy pattern - subtle background */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <circle cx="20" cy="20" r="15" fill="none" stroke="currentColor" strokeWidth="0.1" />
          <circle cx="80" cy="30" r="20" fill="none" stroke="currentColor" strokeWidth="0.1" />
          <circle cx="50" cy="70" r="25" fill="none" stroke="currentColor" strokeWidth="0.1" />
          <path d="M20,20 Q50,10 80,30 T50,70 T20,20" fill="none" stroke="currentColor" strokeWidth="0.05" />
        </svg>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Social proof badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-sis-pomegranate/10
                       rounded-full mb-8 border border-sis-pomegranate/20"
          >
            <TrendingUp className="w-4 h-4 text-sis-pomegranate" />
            <span className="text-sm font-medium text-sis-pomegranate">
              Skandiform sparar 176,000 kr/år med 2030+
            </span>
          </motion.div>

          {/* Main heading - business language */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-sis-gray-900 mb-6 leading-tight">
            Dina kunders miljökrav
            <br />
            <span className="text-sis-pomegranate">besvarade på minuter</span>
          </h1>

          <p className="text-xl sm:text-2xl text-sis-gray-700 mb-4 max-w-3xl mx-auto">
            Miljödeklaration som kunderna kräver - klar på 10 minuter istället för 6 veckor.
          </p>

          {/* Subheading */}
          <p className="text-lg text-sis-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            2030+ Calculator ger svenska tillverkare samma miljödata som storföretagen -
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
                         rounded-xl hover:bg-red-700 transition-all duration-300
                         hover:shadow-xl hover:scale-105 inline-flex items-center justify-center"
            >
              Testa gratis - inget konto krävs
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/products/1"
              className="px-8 py-4 bg-white text-sis-pomegranate font-medium
                         rounded-xl border-2 border-sis-gray-300
                         hover:border-sis-pomegranate hover:bg-sis-gray-50
                         transition-all duration-300 inline-flex items-center justify-center"
            >
              Se en färdig analys
            </Link>
          </motion.div>
        </motion.div>

        {/* Trust indicators - business value */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 bg-sis-pomegranate/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-sis-pomegranate" />
            </div>
            <div>
              <div className="text-sm font-semibold text-sis-gray-900">10 minuter</div>
              <div className="text-xs text-sis-gray-500">istället för 6 veckor</div>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 bg-sis-pomegranate/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-sis-pomegranate" />
            </div>
            <div>
              <div className="text-sm font-semibold text-sis-gray-900">2,000 kr/mån</div>
              <div className="text-xs text-sis-gray-500">istället för 200,000 kr</div>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 bg-sis-pomegranate/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-sis-pomegranate" />
            </div>
            <div>
              <div className="text-sm font-semibold text-sis-gray-900">ISO-godkänd</div>
              <div className="text-xs text-sis-gray-500">redo för upphandling</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
