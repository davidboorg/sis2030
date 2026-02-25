'use client'

import { motion } from 'framer-motion'
import { BadgeCheck, QrCode, Share2, FileDown, Globe } from 'lucide-react'

export default function SustainabilityBadge() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: explanation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-sis-gray-900 mb-4">
              Ditt hållbarhetsbevis - redo att dela
            </h2>
            <p className="text-lg text-sis-gray-600 mb-8 leading-relaxed">
              Varje analys genererar ett verifierat hållbarhetsbevis som du kan använda
              direkt i dina affärer. Ingen extra kostnad, inget krångel.
            </p>

            <div className="space-y-4">
              {[
                { icon: FileDown, text: 'Bifoga i anbud och offerter' },
                { icon: Globe, text: 'Publicera på din hemsida' },
                { icon: Share2, text: 'Dela i sociala medier' },
                { icon: QrCode, text: 'QR-kod direkt på produkten' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-sis-pomegranate/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-sis-pomegranate" />
                  </div>
                  <span className="text-sis-gray-700">{item.text}</span>
                </div>
              ))}
            </div>

            <p className="mt-8 text-sm text-sis-gray-500 leading-relaxed">
              Varje gång du delar ditt bevis sprids kunskapen om att miljödata
              inte behöver vara svårt eller dyrt. Dina kollegor i branschen ser
              och frågar hur du gjort.
            </p>
          </motion.div>

          {/* Right: badge mockup */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="w-full max-w-sm bg-white rounded-2xl border-2 border-sis-gray-200
                            shadow-xl p-8 relative">
              {/* Verified badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="inline-flex items-center gap-1.5 bg-green-600 text-white
                                px-4 py-1.5 rounded-full text-sm font-semibold shadow-md">
                  <BadgeCheck className="w-4 h-4" />
                  Verifierad miljöanalys
                </div>
              </div>

              <div className="mt-4 text-center">
                {/* Product name */}
                <h3 className="text-xl font-bold text-sis-gray-900 mb-1">
                  Kontorsstol Ergo Pro
                </h3>
                <p className="text-sm text-sis-gray-500 mb-6">
                  Skandiform AB &middot; Tibro
                </p>

                {/* Key metrics */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center py-2 border-b border-sis-gray-100">
                    <span className="text-sm text-sis-gray-600">Klimatpåverkan</span>
                    <span className="font-semibold text-sis-gray-900">12.4 kg CO&#x2082;e</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-sis-gray-100">
                    <span className="text-sm text-sis-gray-600">Vattenförbrukning</span>
                    <span className="font-semibold text-sis-gray-900">847 L</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-sis-gray-100">
                    <span className="text-sm text-sis-gray-600">Cirkularitet</span>
                    <span className="font-semibold text-sis-gray-900">34%</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-sis-gray-600">Energianvändning</span>
                    <span className="font-semibold text-sis-gray-900">186 MJ</span>
                  </div>
                </div>

                {/* Standard reference */}
                <div className="bg-sis-gray-50 rounded-lg p-3 mb-4">
                  <div className="text-xs text-sis-gray-500">
                    Beräknad enligt ISO 14067 &middot; ISO 14046 &middot; ISO 59004
                  </div>
                  <div className="text-xs text-sis-gray-400 mt-1">
                    via SIS 2030+ Calculator
                  </div>
                </div>

                {/* QR + verification */}
                <div className="flex items-center justify-center gap-3">
                  <div className="w-16 h-16 bg-sis-gray-100 rounded-lg flex items-center justify-center">
                    <QrCode className="w-10 h-10 text-sis-gray-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-sis-gray-500">Verifierings-ID</div>
                    <div className="text-sm font-mono font-semibold text-sis-gray-700">
                      SIS-2030-00847
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
