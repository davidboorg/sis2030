'use client'

import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { WizardData, INDUSTRY_TEMPLATES } from './types'

// Type for backend calculation results
type BackendResult = {
  product_id: number
  product_name: string
  run_id: number
  template: string
  template_name: string
  indicators: Record<string, number>
  hotspots: Array<{ name: string; share_pct: number }>
  scopes: { scope1: number; scope2: number; scope3: number }
  benchmark: { avg_co2e: number; best_co2e: number; unit: string }
}

type Props = {
  data: WizardData
  isCalculating?: boolean
  backendResult?: BackendResult | null
  error?: string | null
}

// Industry benchmarks (fallback if backend doesn't provide)
const INDUSTRY_BENCHMARKS: Record<string, { avg: number; best: number; unit: string }> = {
  furniture: { avg: 18.2, best: 8.1, unit: 'kg CO₂e/stol' },
  food: { avg: 3.5, best: 1.2, unit: 'kg CO₂e/kg produkt' },
  workshop: { avg: 45.0, best: 22.0, unit: 'kg CO₂e/detalj' },
  construction: { avg: 120.0, best: 65.0, unit: 'kg CO₂e/element' },
  textile: { avg: 8.5, best: 3.2, unit: 'kg CO₂e/plagg' },
}

const SCOPE_COLORS = {
  scope1: '#22c55e', // green
  scope2: '#3b82f6', // blue
  scope3: '#f97316', // orange
}

export default function StepResults({ data, isCalculating, backendResult, error }: Props) {
  // Use backend results if available, otherwise fall back to client-side estimation
  const useBackend = backendResult && backendResult.indicators?.co2e_kg !== undefined

  // Client-side fallback calculation
  const materialWeight = data.materials.reduce((sum, m) => sum + (m.unit === 'kg' ? m.quantity : 0), 0)
  const fallbackScope1 = data.processEmissions ? materialWeight * 0.1 : 0
  const fallbackScope2 = data.electricityKwh * 0.05 + data.heatKwh * 0.1
  const fallbackScope3Materials = materialWeight * 2.5 // More realistic average factor
  const fallbackScope3Transport = (data.supplierDistance + data.customerDistance) * materialWeight * 0.0001
  const fallbackScope3 = fallbackScope3Materials + fallbackScope3Transport
  const fallbackTotalCO2e = fallbackScope1 + fallbackScope2 + fallbackScope3

  // Use backend or fallback values
  const scope1 = useBackend ? backendResult.scopes.scope1 : fallbackScope1
  const scope2 = useBackend ? backendResult.scopes.scope2 : fallbackScope2
  const scope3 = useBackend ? backendResult.scopes.scope3 : fallbackScope3
  const totalCO2e = useBackend ? backendResult.indicators.co2e_kg : fallbackTotalCO2e

  const scopeData = [
    { name: 'Scope 1', value: scope1, color: SCOPE_COLORS.scope1 },
    { name: 'Scope 2', value: scope2, color: SCOPE_COLORS.scope2 },
    { name: 'Scope 3', value: scope3, color: SCOPE_COLORS.scope3 },
  ].filter((s) => s.value > 0)

  // Benchmark comparison - use backend or fallback
  const benchmark = useBackend && backendResult.benchmark?.avg_co2e
    ? { avg: backendResult.benchmark.avg_co2e, best: backendResult.benchmark.best_co2e, unit: backendResult.benchmark.unit }
    : data.templateId
      ? INDUSTRY_BENCHMARKS[data.templateId]
      : null
  const percentVsAvg = benchmark ? ((totalCO2e - benchmark.avg) / benchmark.avg) * 100 : 0
  const isBelowAvg = percentVsAvg < 0

  // Run ID for certificate link
  const runId = backendResult?.run_id

  if (isCalculating) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <motion.div
          className="w-16 h-16 border-4 border-trace-border border-t-sis-pomegranate rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <p className="mt-6 text-trace-text-secondary">Beräknar klimatavtryck...</p>
        <p className="mt-2 text-sm text-trace-text-muted">
          Matchar mot 50 000+ emissionsfaktorer
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      {/* Eyebrow */}
      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-sis-pomegranate">
        Resultat — Screening-LCA
      </span>

      {/* Main result */}
      <div className="mt-4 mb-8">
        <div className="flex items-end gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="font-display text-6xl md:text-7xl font-light text-trace-text">
              {totalCO2e.toFixed(1)}
            </span>
          </motion.div>
          <div className="mb-2">
            <span className="font-mono text-lg text-trace-text-secondary">kg CO₂e</span>
            <p className="text-sm text-trace-text-muted">per {data.productName || 'enhet'}</p>
          </div>
        </div>
      </div>

      {/* Scope donut and breakdown */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Donut chart */}
        <div className="bg-trace-surface p-6 rounded border border-trace-border">
          <div className="font-mono text-[10px] uppercase tracking-wider text-trace-text-muted mb-4">
            Scope-fördelning
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={scopeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {scopeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex justify-center gap-4 mt-4">
            {scopeData.map((scope) => (
              <div key={scope.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: scope.color }} />
                <span className="font-mono text-xs text-trace-text-muted">
                  {scope.name}: {scope.value.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Breakdown list */}
        <div className="bg-trace-surface p-6 rounded border border-trace-border">
          <div className="font-mono text-[10px] uppercase tracking-wider text-trace-text-muted mb-4">
            Detaljerad fördelning
          </div>
          <div className="space-y-3">
            {scope1 > 0 && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-trace-text-secondary">Scope 1 — Direkta emissioner</span>
                  <span className="font-mono text-trace-text">{scope1.toFixed(1)} kg</span>
                </div>
                <div className="h-2 bg-trace-bg rounded overflow-hidden">
                  <motion.div
                    className="h-full"
                    style={{ backgroundColor: SCOPE_COLORS.scope1 }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(scope1 / totalCO2e) * 100}%` }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  />
                </div>
              </div>
            )}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-trace-text-secondary">Scope 2 — El & värme</span>
                <span className="font-mono text-trace-text">{scope2.toFixed(1)} kg</span>
              </div>
              <div className="h-2 bg-trace-bg rounded overflow-hidden">
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: SCOPE_COLORS.scope2 }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(scope2 / totalCO2e) * 100}%` }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-trace-text-secondary">Scope 3 — Upstream & transport</span>
                <span className="font-mono text-trace-text">{scope3.toFixed(1)} kg</span>
              </div>
              <div className="h-2 bg-trace-bg rounded overflow-hidden">
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: SCOPE_COLORS.scope3 }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(scope3 / totalCO2e) * 100}%` }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benchmark comparison */}
      {benchmark && (
        <div className="bg-trace-surface p-6 rounded border border-trace-border mb-8">
          <div className="font-mono text-[10px] uppercase tracking-wider text-trace-text-muted mb-4">
            Jämförelse — {INDUSTRY_TEMPLATES[data.templateId!].name}
          </div>

          {/* Benchmark message */}
          <div className={`mb-4 p-3 rounded ${isBelowAvg ? 'bg-green-900/20' : 'bg-orange-900/20'}`}>
            <p className="text-sm">
              {isBelowAvg ? (
                <>
                  Du ligger <span className="font-medium text-green-400">{Math.abs(percentVsAvg).toFixed(0)}% under</span> branschsnittet!
                </>
              ) : (
                <>
                  Du ligger <span className="font-medium text-orange-400">{percentVsAvg.toFixed(0)}% över</span> branschsnittet. Se rekommendationer nedan.
                </>
              )}
            </p>
          </div>

          {/* Benchmark bars */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-trace-text">Din produkt</span>
                <span className="font-mono text-sis-pomegranate">{totalCO2e.toFixed(1)} kg CO₂e</span>
              </div>
              <div className="h-3 bg-trace-bg rounded overflow-hidden">
                <motion.div
                  className="h-full bg-sis-pomegranate"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((totalCO2e / benchmark.avg) * 50, 100)}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-trace-text-secondary">Branschsnitt</span>
                <span className="font-mono text-trace-text-muted">{benchmark.avg} kg CO₂e</span>
              </div>
              <div className="h-3 bg-trace-bg rounded overflow-hidden">
                <div className="h-full bg-trace-text-muted" style={{ width: '50%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-trace-text-secondary">Bäst i klassen</span>
                <span className="font-mono text-green-400">{benchmark.best} kg CO₂e</span>
              </div>
              <div className="h-3 bg-trace-bg rounded overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${(benchmark.best / benchmark.avg) * 50}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Next step cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <NextStepCard
          icon="📄"
          title="Hållbarhetsbevis"
          description="Ladda ner badge + PDF för anbud och marknadsföring"
          cta="Ladda ner"
          href={runId ? `/certificate/${runId}` : undefined}
        />
        <NextStepCard
          icon="📊"
          title="Förbättra"
          description="Vad händer om du byter till återvunna material?"
          cta="Testa scenario"
        />
        <NextStepCard
          icon="🏆"
          title="Jämför"
          description="Se detaljerad ranking mot konkurrenter i branschen"
          cta="Se benchmark"
        />
        <NextStepCard
          icon="🔗"
          title="Dela"
          description="LinkedIn, kopiera länk, eller bädda in på din webbplats"
          cta="Dela nu"
          href={runId ? `/certificate/${runId}` : undefined}
        />
      </div>

      {/* Error message if API failed */}
      {error && (
        <div className="mt-4 p-3 bg-orange-900/20 border border-orange-500/30 rounded">
          <p className="text-sm text-orange-300">{error}</p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-8 p-4 border border-trace-border rounded">
        <p className="text-xs text-trace-text-muted">
          <span className="font-medium text-trace-text-secondary">Screening-LCA enligt ISO 14040.</span>{' '}
          {useBackend
            ? 'Resultaten är beräknade med TR/ACE-motorn baserat på dina inmatade värden.'
            : 'Uppskattade värden baserade på branschgenomsnitt. Anslut till backend för exakta beräkningar.'}
          {' '}Beräkningen inkluderar cradle-to-gate scope och täcker råmaterialutvinning, tillverkning och transport.
        </p>
      </div>
    </div>
  )
}

function NextStepCard({
  icon,
  title,
  description,
  cta,
  href,
}: {
  icon: string
  title: string
  description: string
  cta: string
  href?: string
}) {
  const content = (
    <>
      {/* Accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-sis-pomegranate to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex gap-4">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <div className="font-medium text-trace-text group-hover:text-sis-pomegranate transition-colors">
            {title}
          </div>
          <p className="text-sm text-trace-text-muted mt-1">{description}</p>
          <span className="inline-flex items-center gap-1 mt-3 font-mono text-xs uppercase tracking-wider text-sis-pomegranate">
            {cta} <span>→</span>
          </span>
        </div>
      </div>
    </>
  )

  if (href) {
    return (
      <motion.a
        href={href}
        className="relative p-5 bg-trace-surface rounded border border-trace-border
          hover:border-trace-border-light hover:bg-trace-surface-2 transition-colors cursor-pointer group block"
        whileHover={{ y: -2 }}
      >
        {content}
      </motion.a>
    )
  }

  return (
    <motion.div
      className="relative p-5 bg-trace-surface rounded border border-trace-border
        hover:border-trace-border-light hover:bg-trace-surface-2 transition-colors cursor-pointer group"
      whileHover={{ y: -2 }}
    >
      {content}
    </motion.div>
  )
}
