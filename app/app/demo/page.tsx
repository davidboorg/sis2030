'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

type Template = {
  id: string
  name: string
  icon: string
  example: string
  materials: string[]
  context: string
}

const templates: Template[] = [
  {
    id: 'furniture',
    name: 'M\u00f6bel',
    icon: '\ud83e\ude91',
    example: 'Kontorsstol',
    materials: ['St\u00e5l', 'Skum', 'Textil', 'Montering'],
    context: 'Tibro, Tran\u00e5s, Lammhult',
  },
  {
    id: 'food',
    name: 'Livsmedel',
    icon: '\ud83d\udce6',
    example: 'F\u00f6rpackat livsmedel',
    materials: ['Kartong', 'Plast', 'Pall', 'Distribution'],
    context: 'F\u00f6rpackning och logistik',
  },
  {
    id: 'workshop',
    name: 'Verkstad',
    icon: '\u2699\ufe0f',
    example: 'CNC-bearbetad detalj',
    materials: ['St\u00e5l', 'CNC', 'Ytbehandling'],
    context: 'Underleverant\u00f6r fordon/industri',
  },
]

type Hotspot = { name: string; share_pct?: number; contribution_pct?: number }
type Recommendation = { action: string; impact: string; standard: string }
type AISuggestion = { action: string; rationale: string; expected_delta?: Record<string, number> }

type DemoResult = {
  product_id: number
  product_name: string
  run_id: number
  template_name: string
  indicators: Record<string, number>
  hotspots: Hotspot[]
  recommendations: Recommendation[]
  ai_suggestions: AISuggestion[]
  components: { name: string; quantity: number; unit: string }[]
}

export default function DemoPage() {
  const [step, setStep] = useState<'pain' | 'roi' | 'choose' | 'loading' | 'result'>('pain')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [result, setResult] = useState<DemoResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // ROI calculator state
  const [revenue, setRevenue] = useState<number>(10) // MSEK
  const [tenderShare, setTenderShare] = useState<number>(30) // %
  const riskAmount = Math.round(revenue * (tenderShare / 100) * 0.15 * 1000) // 15% loss risk

  const runDemo = async (templateId: string) => {
    setSelectedId(templateId)
    setStep('loading')
    setError(null)

    try {
      const response = await fetch(`${API_URL}/demo/${templateId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!response.ok) throw new Error('Ber\u00e4kningen misslyckades')
      const data: DemoResult = await response.json()
      setResult(data)
      setStep('result')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'N\u00e5got gick fel')
      setStep('choose')
    }
  }

  const reset = () => {
    setStep('pain')
    setSelectedId(null)
    setResult(null)
  }

  return (
    <main className="min-h-screen bg-trace-void text-trace-parchment">
      {/* Header */}
      <header className="border-b border-trace-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-display text-xl font-light tracking-tight">
            TR<span className="text-trace-gold italic">/</span>ACE
          </Link>
          <div className="font-mono text-[10px] tracking-[0.15em] text-trace-parchment/50 uppercase">
            {step === 'pain' && 'Steg 1 av 4'}
            {step === 'roi' && 'Steg 2 av 4'}
            {step === 'choose' && 'Steg 3 av 4'}
            {step === 'loading' && 'Ber\u00e4knar...'}
            {step === 'result' && 'Resultat'}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">

          {/* ════════════════════════════════════════════════════════════
              STEP 1: PAIN — What does a "no" cost?
              ════════════════════════════════════════════════════════════ */}
          {step === 'pain' && (
            <motion.div
              key="pain"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              {/* Eyebrow */}
              <div className="font-mono text-[10px] tracking-[0.2em] text-trace-gold uppercase mb-6 flex items-center gap-3">
                <span className="w-6 h-px bg-trace-gold" />
                Innan vi b\u00f6rjar
              </div>

              {/* Main stat */}
              <h1 className="font-display text-5xl md:text-6xl font-light tracking-tight mb-8">
                <span className="text-trace-gold">847 Mkr</span><span className="text-trace-parchment/30">.</span>
              </h1>
              <p className="text-xl text-trace-parchment/70 mb-8 leading-relaxed max-w-xl">
                S\u00e5 mycket f\u00f6rlorade svenska SME:er i offentliga upphandlingar f\u00f6rra \u00e5ret
                p\u00e5 grund av <span className="text-trace-parchment">saknad eller otillr\u00e4cklig milj\u00f6data</span>.
              </p>

              {/* Pain points */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-trace-border mb-12">
                <div className="bg-trace-surface p-6">
                  <div className="font-mono text-3xl text-trace-parchment mb-2">68%</div>
                  <p className="font-mono text-xs text-trace-parchment/50">
                    av ink\u00f6pare kr\u00e4ver nu milj\u00f6deklaration i offertf\u00f6rfr\u00e5gan
                  </p>
                </div>
                <div className="bg-trace-surface p-6">
                  <div className="font-mono text-3xl text-trace-parchment mb-2">6 v</div>
                  <p className="font-mono text-xs text-trace-parchment/50">
                    tar en traditionell LCA-konsult. Upphandlingen st\u00e4nger om 2.
                  </p>
                </div>
                <div className="bg-trace-surface p-6">
                  <div className="font-mono text-3xl text-trace-parchment mb-2">200k</div>
                  <p className="font-mono text-xs text-trace-parchment/50">
                    kronor kostar en LCA. Offerten \u00e4r v\u00e4rd 400k.
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="border-t border-trace-border pt-8">
                <p className="text-trace-parchment/50 mb-6">
                  TR/ACE l\u00f6ser det p\u00e5 10 minuter. L\u00e5t oss visa vad det betyder f\u00f6r dig.
                </p>
                <button
                  onClick={() => setStep('roi')}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-trace-parchment text-trace-void
                             font-mono text-sm tracking-wide uppercase hover:bg-trace-gold transition-colors"
                >
                  Ber\u00e4kna min risk
                  <span>\u2192</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════
              STEP 2: ROI Calculator
              ════════════════════════════════════════════════════════════ */}
          {step === 'roi' && (
            <motion.div
              key="roi"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              <div className="font-mono text-[10px] tracking-[0.2em] text-trace-gold uppercase mb-6 flex items-center gap-3">
                <span className="w-6 h-px bg-trace-gold" />
                ROI-kalkylator
              </div>

              <h2 className="font-display text-4xl font-light tracking-tight mb-4">
                Vad riskerar du<span className="text-trace-gold">?</span>
              </h2>
              <p className="text-trace-parchment/60 mb-10">
                Tv\u00e5 snabba fr\u00e5gor. Sedan visar vi vad saknad milj\u00f6data kan kosta dig.
              </p>

              {/* Calculator inputs */}
              <div className="space-y-8 mb-12">
                {/* Revenue */}
                <div className="border border-trace-border bg-trace-surface p-6">
                  <label className="font-mono text-[10px] tracking-[0.15em] text-trace-parchment/50 uppercase block mb-4">
                    Ungef\u00e4rlig \u00e5rsoms\u00e4ttning (MSEK)
                  </label>
                  <div className="flex items-center gap-6">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={revenue}
                      onChange={(e) => setRevenue(Number(e.target.value))}
                      className="flex-1 h-1 bg-trace-border rounded-none appearance-none cursor-pointer
                                 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                                 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-trace-gold
                                 [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                    <div className="font-mono text-2xl text-trace-parchment w-20 text-right">
                      {revenue} <span className="text-sm text-trace-parchment/50">Mkr</span>
                    </div>
                  </div>
                </div>

                {/* Tender share */}
                <div className="border border-trace-border bg-trace-surface p-6">
                  <label className="font-mono text-[10px] tracking-[0.15em] text-trace-parchment/50 uppercase block mb-4">
                    Andel som kommer fr\u00e5n upphandlingar/aff\u00e4rer med milj\u00f6krav (%)
                  </label>
                  <div className="flex items-center gap-6">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={tenderShare}
                      onChange={(e) => setTenderShare(Number(e.target.value))}
                      className="flex-1 h-1 bg-trace-border rounded-none appearance-none cursor-pointer
                                 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                                 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-trace-gold
                                 [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                    <div className="font-mono text-2xl text-trace-parchment w-20 text-right">
                      {tenderShare}<span className="text-sm text-trace-parchment/50">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Result */}
              <div className="border border-trace-gold bg-trace-surface-2 p-8 mb-8">
                <div className="font-mono text-[10px] tracking-[0.15em] text-trace-gold uppercase mb-4">
                  Din \u00e5rliga risk
                </div>
                <div className="font-display text-5xl font-light text-trace-parchment mb-4">
                  {riskAmount.toLocaleString('sv-SE')} <span className="text-2xl text-trace-parchment/50">tkr</span>
                </div>
                <p className="text-sm text-trace-parchment/60 mb-6">
                  Det \u00e4r vad du riskerar att f\u00f6rlora varje \u00e5r p\u00e5 grund av saknad milj\u00f6data.
                  TR/ACE kostar <span className="text-trace-parchment">24 000 kr/\u00e5r</span>.
                </p>
                <div className="font-mono text-sm">
                  <span className="text-trace-verified">ROI: {Math.round(riskAmount / 24)}x</span>
                  <span className="text-trace-parchment/40 ml-3">|</span>
                  <span className="text-trace-parchment/60 ml-3">Payback: {Math.round(24000 / (riskAmount * 10))} dagar</span>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep('pain')}
                  className="font-mono text-sm text-trace-parchment/50 hover:text-trace-parchment transition-colors"
                >
                  \u2190 Tillbaka
                </button>
                <button
                  onClick={() => setStep('choose')}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-trace-parchment text-trace-void
                             font-mono text-sm tracking-wide uppercase hover:bg-trace-gold transition-colors"
                >
                  Se hur det fungerar
                  <span>\u2192</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════
              STEP 3: Choose Industry — Three visual cards
              ════════════════════════════════════════════════════════════ */}
          {step === 'choose' && (
            <motion.div
              key="choose"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center max-w-2xl mx-auto mb-12">
                <div className="font-mono text-[10px] tracking-[0.2em] text-trace-gold uppercase mb-6 flex items-center justify-center gap-3">
                  <span className="w-6 h-px bg-trace-gold" />
                  V\u00e4lj din bransch
                  <span className="w-6 h-px bg-trace-gold" />
                </div>
                <h2 className="font-display text-4xl font-light tracking-tight mb-4">
                  Vilken typ av produkt tillverkar du<span className="text-trace-gold">?</span>
                </h2>
                <p className="text-trace-parchment/60">
                  V\u00e4lj den som passar b\u00e4st. Du f\u00e5r ett riktigt ber\u00e4knat resultat p\u00e5 under 10 sekunder.
                </p>
              </div>

              {error && (
                <div className="mb-8 border border-trace-error bg-trace-error/10 text-trace-error px-6 py-4 font-mono text-sm">
                  {error}
                </div>
              )}

              {/* Industry cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-trace-border">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => runDemo(t.id)}
                    className="group bg-trace-surface p-8 text-left hover:bg-trace-surface-2 transition-colors relative"
                  >
                    {/* Gold accent on hover */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-trace-gold opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Icon */}
                    <div className="text-5xl mb-6">{t.icon}</div>

                    {/* Name */}
                    <h3 className="font-display text-2xl font-light text-trace-parchment mb-2 group-hover:text-trace-gold transition-colors">
                      {t.name}
                    </h3>

                    {/* Example */}
                    <p className="font-mono text-sm text-trace-parchment/60 mb-4">
                      Exempel: {t.example}
                    </p>

                    {/* Materials */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {t.materials.map((m, i) => (
                        <span key={i} className="font-mono text-[10px] px-2 py-1 border border-trace-border text-trace-parchment/50">
                          {m}
                        </span>
                      ))}
                    </div>

                    {/* Context */}
                    <p className="font-mono text-xs text-trace-parchment/40 mb-6">
                      {t.context}
                    </p>

                    {/* CTA */}
                    <div className="font-mono text-sm text-trace-parchment/50 group-hover:text-trace-gold transition-colors flex items-center gap-2">
                      Ber\u00e4kna
                      <span className="group-hover:translate-x-1 transition-transform">\u2192</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Back button */}
              <div className="mt-8">
                <button
                  onClick={() => setStep('roi')}
                  className="font-mono text-sm text-trace-parchment/50 hover:text-trace-parchment transition-colors"
                >
                  \u2190 Tillbaka till ROI-kalkylatorn
                </button>
              </div>

              {/* Trust */}
              <div className="mt-12 text-center border-t border-trace-border pt-8">
                <p className="font-mono text-xs text-trace-parchment/40">
                  Inget konto kr\u00e4vs. Inga uppgifter sparas om du inte v\u00e4ljer att skapa konto.
                </p>
              </div>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════
              LOADING
              ════════════════════════════════════════════════════════════ */}
          {step === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32"
            >
              {/* Spinner */}
              <div className="w-16 h-16 border border-trace-border relative mb-8">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display text-2xl text-trace-gold italic animate-pulse">/</span>
                </div>
              </div>

              <h2 className="font-display text-2xl font-light text-trace-parchment mb-4">
                Ber\u00e4knar milj\u00f6p\u00e5verkan...
              </h2>
              <p className="text-trace-parchment/50 text-sm max-w-md text-center mb-8">
                Skapar produkt, ber\u00e4knar 8 milj\u00f6indikatorer enligt ISO 14040,
                identifierar hotspots och genererar f\u00f6rb\u00e4ttringsf\u00f6rslag.
              </p>
              <div className="flex gap-6 font-mono text-[10px] tracking-[0.1em] text-trace-parchment/40 uppercase">
                <span>ISO 14040</span>
                <span>ISO 14044</span>
                <span>ISO 14067</span>
              </div>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════
              STEP 4: Results
              ════════════════════════════════════════════════════════════ */}
          {step === 'result' && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Result header */}
              <div className="border border-trace-border bg-trace-surface relative">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-trace-verified to-transparent" />
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-trace-verified rounded-full shadow-[0_0_8px_#7EE8A2]" />
                    <span className="font-mono text-[10px] tracking-[0.15em] text-trace-verified uppercase">
                      Ber\u00e4kning klar
                    </span>
                  </div>
                  <h1 className="font-display text-4xl font-light text-trace-parchment mb-2">
                    {result.product_name.replace('[Demo] ', '')}
                  </h1>
                  <p className="font-mono text-sm text-trace-parchment/50">
                    {result.template_name} \u00b7 {result.components.length} komponenter \u00b7 ISO 14040/14044
                  </p>
                  <button
                    onClick={reset}
                    className="mt-4 font-mono text-xs text-trace-parchment/40 hover:text-trace-parchment transition-colors"
                  >
                    \u2190 B\u00f6rja om
                  </button>
                </div>
              </div>

              {/* 4 key indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-trace-border">
                {[
                  { key: 'co2e_kg', label: 'Klimatp\u00e5verkan', unit: 'kg CO\u2082e' },
                  { key: 'water_l', label: 'Vattenf\u00f6rbrukning', unit: 'liter' },
                  { key: 'energy_mj', label: 'Energianv\u00e4ndning', unit: 'MJ' },
                  { key: 'circularity_pct', label: 'Cirkularitet', unit: '%' },
                ].map((ind) => {
                  const value = result.indicators[ind.key] ?? 0
                  return (
                    <div key={ind.key} className="bg-trace-surface p-6">
                      <div className="font-mono text-[9px] tracking-[0.15em] text-trace-parchment/40 uppercase mb-2">
                        {ind.label}
                      </div>
                      <div className="font-mono text-3xl text-trace-parchment">
                        {typeof value === 'number' ? value.toLocaleString('sv-SE', { maximumFractionDigits: 1 }) : value}
                      </div>
                      <div className="font-mono text-xs text-trace-parchment/50">{ind.unit}</div>
                    </div>
                  )
                })}
              </div>

              {/* Hotspots + Components */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-trace-border">
                {/* Hotspots */}
                <div className="bg-trace-surface p-8">
                  <h3 className="font-mono text-[10px] tracking-[0.15em] text-trace-parchment/50 uppercase mb-6">
                    Hotspots \u2014 var kommer p\u00e5verkan ifr\u00e5n?
                  </h3>
                  {result.hotspots.length === 0 ? (
                    <p className="text-sm text-trace-parchment/50">Inga hotspots identifierade.</p>
                  ) : (
                    <div className="space-y-4">
                      {result.hotspots.map((hs, i) => {
                        const pct = hs.share_pct ?? hs.contribution_pct ?? 0
                        return (
                          <div key={i}>
                            <div className="flex justify-between font-mono text-sm mb-2">
                              <span className="text-trace-parchment">{hs.name}</span>
                              <span className="text-trace-parchment/60">{pct}%</span>
                            </div>
                            <div className="w-full h-1 bg-trace-border">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8, delay: i * 0.15 }}
                                className="h-1 bg-trace-gold"
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Components */}
                <div className="bg-trace-surface p-8">
                  <h3 className="font-mono text-[10px] tracking-[0.15em] text-trace-parchment/50 uppercase mb-6">
                    Produktens komponenter
                  </h3>
                  <div className="space-y-3">
                    {result.components.map((comp, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-trace-border last:border-0">
                        <span className="font-mono text-sm text-trace-parchment">{comp.name}</span>
                        <span className="font-mono text-sm text-trace-parchment/50">
                          {comp.quantity} {comp.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {result.recommendations.length > 0 && (
                <div className="border border-trace-border bg-trace-surface p-8">
                  <h3 className="font-mono text-[10px] tracking-[0.15em] text-trace-verified uppercase mb-6">
                    F\u00f6rb\u00e4ttringsf\u00f6rslag
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {result.recommendations.map((rec, i) => (
                      <div key={i} className="border-l-2 border-trace-verified pl-4">
                        <div className="font-mono text-sm text-trace-parchment mb-1">{rec.action}</div>
                        <div className="font-mono text-xs text-trace-verified">{rec.impact}</div>
                        <div className="font-mono text-[10px] text-trace-parchment/40 mt-2">{rec.standard}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Badge + CTA */}
              <div className="border border-trace-gold bg-trace-surface-2">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  {/* Badge preview */}
                  <div className="p-8 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-trace-border">
                    <div className="border border-trace-border bg-trace-surface p-6 max-w-xs w-full relative">
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-trace-gold to-trace-verified" />

                      <div className="flex items-center justify-between mb-4">
                        <span className="font-display text-lg font-light">TR<span className="text-trace-gold italic">/</span>ACE</span>
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-trace-verified rounded-full" />
                          <span className="font-mono text-[8px] text-trace-verified uppercase">Verified</span>
                        </div>
                      </div>

                      <div className="font-mono text-sm text-trace-parchment mb-4">
                        {result.product_name.replace('[Demo] ', '')}
                      </div>

                      <div className="space-y-2 border-t border-trace-border pt-4">
                        <div className="flex justify-between font-mono text-xs">
                          <span className="text-trace-parchment/50">CO\u2082e</span>
                          <span className="text-trace-parchment">{result.indicators.co2e_kg?.toFixed(1)} kg</span>
                        </div>
                        <div className="flex justify-between font-mono text-xs">
                          <span className="text-trace-parchment/50">Vatten</span>
                          <span className="text-trace-parchment">{result.indicators.water_l?.toFixed(0)} L</span>
                        </div>
                        <div className="flex justify-between font-mono text-xs">
                          <span className="text-trace-parchment/50">Cirkularitet</span>
                          <span className="text-trace-parchment">{result.indicators.circularity_pct?.toFixed(0)}%</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-trace-border">
                        <div className="font-mono text-[9px] text-trace-parchment/40">
                          TRC-2025-{String(result.run_id).padStart(5, '0')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="p-8">
                    <div className="font-mono text-[10px] tracking-[0.15em] text-trace-gold uppercase mb-4">
                      N\u00e4sta steg
                    </div>
                    <h3 className="font-display text-3xl font-light text-trace-parchment mb-4">
                      Det h\u00e4r tog 10 sekunder<span className="text-trace-gold">.</span>
                    </h3>
                    <p className="text-trace-parchment/60 mb-8 leading-relaxed">
                      Med ett konto kan du justera varje komponent, k\u00f6ra nya scenarier,
                      exportera ISO-rapport som PDF, och f\u00e5 ett h\u00e5llbarhetsbevis att
                      bifoga i offerter.
                    </p>

                    <div className="space-y-3">
                      <Link
                        href="/dashboard"
                        className="w-full flex items-center justify-center gap-3 px-8 py-4
                                   bg-trace-parchment text-trace-void font-mono text-sm tracking-wide uppercase
                                   hover:bg-trace-gold transition-colors"
                      >
                        Skapa konto och forts\u00e4tt
                        <span>\u2192</span>
                      </Link>
                      <Link
                        href={`/certificate/${result.run_id}`}
                        className="w-full flex items-center justify-center gap-3 px-8 py-4
                                   border border-trace-border text-trace-parchment font-mono text-sm tracking-wide uppercase
                                   hover:border-trace-gold hover:text-trace-gold transition-colors"
                      >
                        Se certifikatsidan
                        <span>\u2192</span>
                      </Link>
                    </div>

                    <p className="font-mono text-[10px] text-trace-parchment/40 mt-6">
                      2 000 kr/m\u00e5n \u00b7 Obegr\u00e4nsat antal produkter \u00b7 Avsluta n\u00e4r du vill
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
