'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

type WizardStep = {
  id: string
  label: string
}

const STEPS: WizardStep[] = [
  { id: 'company', label: 'Företag' },
  { id: 'product', label: 'Produkt' },
  { id: 'materials', label: 'Material' },
  { id: 'energy', label: 'Tillverkning' },
  { id: 'transport', label: 'Transport' },
  { id: 'results', label: 'Resultat' },
]

type WizardShellProps = {
  currentStep: number
  children: React.ReactNode
  onBack?: () => void
  onNext?: () => void
  nextLabel?: string
  nextDisabled?: boolean
  showSaveExit?: boolean
  hideNavigation?: boolean
}

export default function WizardShell({
  currentStep,
  children,
  onBack,
  onNext,
  nextLabel = 'Nästa',
  nextDisabled = false,
  showSaveExit = true,
  hideNavigation = false,
}: WizardShellProps) {
  const progress = ((currentStep + 1) / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-trace-bg flex flex-col">
      {/* Header */}
      <header className="border-b border-trace-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-display text-xl font-light tracking-tight">
            TR<span className="text-sis-pomegranate italic">/</span>ACE
          </Link>

          <div className="flex items-center gap-6">
            {/* Step indicator */}
            <div className="hidden md:flex items-center gap-2">
              {STEPS.map((step, idx) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs
                      ${idx < currentStep
                        ? 'bg-sis-pomegranate text-white'
                        : idx === currentStep
                          ? 'border-2 border-sis-pomegranate text-sis-pomegranate'
                          : 'border border-trace-border text-trace-text-muted'
                      }`}
                  >
                    {idx < currentStep ? '✓' : idx + 1}
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`w-4 h-px mx-1 ${idx < currentStep ? 'bg-sis-pomegranate' : 'bg-trace-border'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Mobile step indicator */}
            <div className="md:hidden font-mono text-[10px] tracking-[0.15em] text-trace-text-muted uppercase">
              Steg {currentStep + 1} / {STEPS.length}
            </div>

            {/* Save & Exit */}
            {showSaveExit && (
              <Link
                href="/"
                className="font-mono text-xs text-trace-text-muted hover:text-trace-text transition-colors"
              >
                Spara & avsluta
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col">
        <div className="max-w-4xl mx-auto px-6 py-12 w-full flex-1">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>

        {/* Navigation */}
        {!hideNavigation && (
          <div className="border-t border-trace-border bg-trace-surface">
            <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
              {/* Back */}
              {onBack ? (
                <button
                  onClick={onBack}
                  className="font-mono text-sm text-trace-text-muted hover:text-trace-text transition-colors flex items-center gap-2"
                >
                  <span>←</span>
                  Tillbaka
                </button>
              ) : (
                <div />
              )}

              {/* Progress bar (mobile) */}
              <div className="absolute left-0 right-0 top-0 h-[3px] bg-trace-border md:hidden">
                <motion.div
                  className="h-full bg-sis-pomegranate"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Next */}
              {onNext && (
                <button
                  onClick={onNext}
                  disabled={nextDisabled}
                  className={`inline-flex items-center gap-3 px-8 py-3 font-mono text-sm tracking-wide uppercase
                    transition-colors border
                    ${nextDisabled
                      ? 'bg-trace-surface-2 border-trace-border text-trace-text-muted cursor-not-allowed'
                      : 'bg-sis-pomegranate border-sis-pomegranate text-white hover:bg-red-600'
                    }`}
                >
                  {nextLabel}
                  <span>→</span>
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Bottom progress bar (desktop) */}
      <div className="hidden md:block h-1 bg-trace-border">
        <motion.div
          className="h-full bg-gradient-to-r from-sis-pomegranate to-sis-pomegranate/70"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  )
}

export { STEPS }
export type { WizardStep }
