'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calculator, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function ROICalculator() {
  const [products, setProducts] = useState(3)
  const [tenders, setTenders] = useState(5)
  const [orderValue, setOrderValue] = useState(250000)

  const lostRevenue = tenders * orderValue
  const consultCost = products * 200000
  const annualCost = 24000
  const savings = consultCost - annualCost
  const roi = Math.round(((savings + lostRevenue * 0.2) / annualCost) * 100)

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-sis-gray-900 mb-4">
            Vad kostar det dig att inte veta?
          </h2>
          <p className="text-lg text-sis-gray-600 max-w-2xl mx-auto">
            Räkna på vad miljödata är värt för just ditt företag.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-sis-gray-50 to-white rounded-2xl border border-sis-gray-200 p-6 sm:p-10"
        >
          {/* Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <div>
              <label className="block text-sm font-medium text-sis-gray-700 mb-2">
                Antal produkter du tillverkar
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={products}
                onChange={(e) => setProducts(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full rounded-xl border border-sis-gray-200 px-4 py-3 text-lg font-semibold
                           text-sis-gray-900 focus:outline-none focus:ring-2 focus:ring-sis-pomegranate/40
                           focus:border-sis-pomegranate"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sis-gray-700 mb-2">
                Upphandlingar du söker per år
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={tenders}
                onChange={(e) => setTenders(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full rounded-xl border border-sis-gray-200 px-4 py-3 text-lg font-semibold
                           text-sis-gray-900 focus:outline-none focus:ring-2 focus:ring-sis-pomegranate/40
                           focus:border-sis-pomegranate"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sis-gray-700 mb-2">
                Genomsnittligt ordervärde (kr)
              </label>
              <input
                type="number"
                min={0}
                step={10000}
                value={orderValue}
                onChange={(e) => setOrderValue(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full rounded-xl border border-sis-gray-200 px-4 py-3 text-lg font-semibold
                           text-sis-gray-900 focus:outline-none focus:ring-2 focus:ring-sis-pomegranate/40
                           focus:border-sis-pomegranate"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-sis-gray-200 my-8" />

          {/* Results */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 bg-red-50 rounded-xl">
              <div className="text-xs font-medium text-sis-gray-500 uppercase tracking-wide mb-1">
                Konsultkostnad idag
              </div>
              <div className="text-2xl font-bold text-red-700">
                {consultCost.toLocaleString('sv-SE')} kr
              </div>
              <div className="text-xs text-sis-gray-500 mt-1">
                {products} produkter x 200,000 kr
              </div>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-xl">
              <div className="text-xs font-medium text-sis-gray-500 uppercase tracking-wide mb-1">
                Potentiellt tappade affärer
              </div>
              <div className="text-2xl font-bold text-amber-700">
                {lostRevenue.toLocaleString('sv-SE')} kr
              </div>
              <div className="text-xs text-sis-gray-500 mt-1">
                {tenders} upphandlingar utan miljödata
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-xs font-medium text-sis-gray-500 uppercase tracking-wide mb-1">
                Med 2030+ Calculator
              </div>
              <div className="text-2xl font-bold text-green-700">
                {annualCost.toLocaleString('sv-SE')} kr/år
              </div>
              <div className="text-xs text-sis-gray-500 mt-1">
                Alla produkter, obegränsat
              </div>
            </div>
          </div>

          {/* ROI highlight */}
          <div className="text-center bg-sis-pomegranate/5 rounded-xl p-6 border border-sis-pomegranate/10">
            <div className="text-sm text-sis-gray-600 mb-1">Din potentiella besparing</div>
            <div className="text-4xl font-bold text-sis-pomegranate mb-1">
              {savings.toLocaleString('sv-SE')} kr/år
            </div>
            <div className="text-sm text-sis-gray-500">
              enbart i konsultkostnader &middot; ROI: {roi.toLocaleString('sv-SE')}%
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-8">
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 px-8 py-4
                         bg-sis-pomegranate text-white font-medium rounded-xl
                         hover:bg-red-700 hover:shadow-xl hover:scale-105
                         transition-all duration-300"
            >
              <Calculator className="w-5 h-5" />
              Starta din analys
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
