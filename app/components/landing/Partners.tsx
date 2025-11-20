'use client'

import { motion } from 'framer-motion'

export default function Partners() {
  return (
    <section className="py-20 px-6 bg-sis-gray-50">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {/* Partner logos */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 mb-12">
            {/* SIS Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-sis-pomegranate rounded-lg 
                              flex items-center justify-center">
                <span className="text-white font-bold text-lg">SIS</span>
              </div>
              <span className="text-xl font-semibold text-sis-gray-900">
                Svenska institutet för standarder
              </span>
            </div>
            
            {/* Divider */}
            <div className="hidden md:block w-px h-12 bg-sis-gray-300" />
            
            {/* Surprise Ventures */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-sis-gray-700 rounded-lg 
                              flex items-center justify-center">
                <span className="text-white font-bold text-lg">SV</span>
              </div>
              <span className="text-xl font-semibold text-sis-gray-900">
                Surprise Ventures
              </span>
            </div>
            
            {/* Divider */}
            <div className="hidden md:block w-px h-12 bg-sis-gray-300" />
            
            {/* 2030+ Initiative */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-sis-gray-800 rounded-lg 
                              flex items-center justify-center">
                <span className="text-white font-bold text-lg">2+</span>
              </div>
              <span className="text-xl font-semibold text-sis-gray-900">
                2030+ Initiative
              </span>
            </div>
          </div>

          {/* Description text */}
          <p className="text-sis-gray-600 max-w-2xl mx-auto leading-relaxed">
            Utvecklat i samarbete mellan SIS och Surprise Ventures för att göra 
            standarder praktiskt användbara i hållbar produktutveckling.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
