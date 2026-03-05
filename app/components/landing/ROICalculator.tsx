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
    <section className="py-24 px-6 bg-trace-bg border-t border-trace-border">
      <div className="max-w-4xl mx-auto">
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
              ROI-kalkylator
            </span>
            <span className="w-8 h-px bg-trace-border-light" />
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-trace-text mb-4">
            Vad kostar det dig att <span className="text-sis-pomegranate italic">inte veta?</span>
          </h2>
          <p className="text-base text-trace-text-muted max-w-2xl mx-auto">
            Räkna på vad miljödata är värt för just ditt företag.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="border border-trace-border"
        >
          {/* Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-trace-border">
            <div className="bg-trace-bg p-6">
              <label className="block font-mono text-[9px] tracking-[0.15em] uppercase text-trace-text-muted mb-3">
                Antal produkter du tillverkar
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={products}
                onChange={(e) => setProducts(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-trace-surface border border-trace-border-light px-4 py-3 text-lg font-medium
                           text-trace-text focus:outline-none focus:border-sis-pomegranate"
              />
            </div>
            <div className="bg-trace-bg p-6">
              <label className="block font-mono text-[9px] tracking-[0.15em] uppercase text-trace-text-muted mb-3">
                Upphandlingar du söker per år
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={tenders}
                onChange={(e) => setTenders(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-trace-surface border border-trace-border-light px-4 py-3 text-lg font-medium
                           text-trace-text focus:outline-none focus:border-sis-pomegranate"
              />
            </div>
            <div className="bg-trace-bg p-6">
              <label className="block font-mono text-[9px] tracking-[0.15em] uppercase text-trace-text-muted mb-3">
                Genomsnittligt ordervärde (kr)
              </label>
              <input
                type="number"
                min={0}
                step={10000}
                value={orderValue}
                onChange={(e) => setOrderValue(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-trace-surface border border-trace-border-light px-4 py-3 text-lg font-medium
                           text-trace-text focus:outline-none focus:border-sis-pomegranate"
              />
            </div>
          </div>

          {/* Results */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-trace-border">
            <div className="bg-trace-surface p-6 text-center">
              <div className="font-mono text-[9px] tracking-[0.15em] uppercase text-trace-text-muted mb-2">
                Konsultkostnad idag
              </div>
              <div className="text-2xl font-display font-light text-sis-pomegranate">
                {consultCost.toLocaleString('sv-SE')} kr
              </div>
              <div className="text-xs text-trace-text-muted mt-1">
                {products} produkter x 200,000 kr
              </div>
            </div>
            <div className="bg-trace-surface p-6 text-center">
              <div className="font-mono text-[9px] tracking-[0.15em] uppercase text-trace-text-muted mb-2">
                Potentiellt tappade affärer
              </div>
              <div className="text-2xl font-display font-light text-trace-text-secondary">
                {lostRevenue.toLocaleString('sv-SE')} kr
              </div>
              <div className="text-xs text-trace-text-muted mt-1">
                {tenders} upphandlingar utan miljödata
              </div>
            </div>
            <div className="bg-trace-surface p-6 text-center">
              <div className="font-mono text-[9px] tracking-[0.15em] uppercase text-trace-text-muted mb-2">
                Med TR/ACE
              </div>
              <div className="text-2xl font-display font-light text-verified">
                {annualCost.toLocaleString('sv-SE')} kr/år
              </div>
              <div className="text-xs text-trace-text-muted mt-1">
                Alla produkter, obegränsat
              </div>
            </div>
          </div>

          {/* ROI highlight */}
          <div className="p-8 bg-trace-bg text-center border-t border-trace-border">
            <div className="text-sm text-trace-text-muted mb-2">Din potentiella besparing</div>
            <div className="font-display text-4xl font-light text-sis-pomegranate mb-2">
              {savings.toLocaleString('sv-SE')} kr/år
            </div>
            <div className="text-sm text-trace-text-muted">
              enbart i konsultkostnader &middot; ROI: {roi.toLocaleString('sv-SE')}%
            </div>
          </div>

          {/* CTA */}
          <div className="p-6 bg-trace-surface text-center border-t border-trace-border">
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 px-8 py-4
                         bg-sis-pomegranate text-white font-medium
                         hover:bg-red-600 transition-all duration-300
                         border border-sis-pomegranate"
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
