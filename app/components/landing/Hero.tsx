'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, BarChart3 } from 'lucide-react'

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
          {/* SIS Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-sis-pomegranate/10 
                       rounded-full mb-8 border border-sis-pomegranate/20"
          >
            <BarChart3 className="w-4 h-4 text-sis-pomegranate" />
            <span className="text-sm font-medium text-sis-pomegranate">
              ISO 14067 | 14046 | 14055 | 59004
            </span>
          </motion.div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-6xl font-bold text-sis-gray-900 mb-6 leading-tight">
            Digitalisering av hållbarhetsstandarder
          </h1>
          
          <p className="text-2xl text-sis-gray-700 mb-4 max-w-3xl mx-auto">
            Med 2030+ Calculator får du svar på sekunder, inte veckor.
          </p>

          {/* Subheading */}
          <p className="text-xl text-sis-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transparent klimatdata som alla förstår. 2030+ Calculator gör internationella
            ISO-standarder praktiskt tillämpbara för svenska tillverkningsföretag genom
            digital livscykelanalys och cirkuläritetsbedömning.
          </p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/products/1"
              className="group px-8 py-4 bg-sis-pomegranate text-white font-medium 
                         rounded-xl hover:bg-red-700 transition-all duration-300
                         hover:shadow-xl hover:scale-105 inline-flex items-center justify-center"
            >
              Starta analys
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              href="/products/new"
              className="px-8 py-4 bg-white text-sis-pomegranate font-medium 
                         rounded-xl border-2 border-sis-gray-300 
                         hover:border-sis-pomegranate hover:bg-sis-gray-50
                         transition-all duration-300 inline-flex items-center justify-center"
            >
              Läs mer om projektet
            </Link>
          </motion.div>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 flex justify-center items-center gap-8 text-sm text-sis-gray-500"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-sis-pomegranate rounded-full" />
            <span>Cradle-to-gate analys</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-sis-pomegranate rounded-full" />
            <span>8 miljöindikatorer</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-sis-pomegranate rounded-full" />
            <span>SIS-godkänd implementation</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
