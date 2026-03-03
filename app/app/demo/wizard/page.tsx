'use client'

import { useState, useCallback } from 'react'
import WizardShell from '@/components/wizard/WizardShell'
import StepCompany from '@/components/wizard/StepCompany'
import StepProduct from '@/components/wizard/StepProduct'
import StepMaterials from '@/components/wizard/StepMaterials'
import StepEnergy from '@/components/wizard/StepEnergy'
import StepTransport from '@/components/wizard/StepTransport'
import StepResults from '@/components/wizard/StepResults'
import { WizardData, INITIAL_WIZARD_DATA } from '@/components/wizard/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

// Type for backend calculation results
type CalculationResult = {
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

export default function WizardDemoPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<WizardData>(INITIAL_WIZARD_DATA)
  const [isCalculating, setIsCalculating] = useState(false)
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null)
  const [calculationError, setCalculationError] = useState<string | null>(null)

  const updateData = useCallback((updates: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }, [])

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Company
        return data.companyName.trim().length > 0
      case 1: // Product
        return data.templateId !== null
      case 2: // Materials
        return data.materials.length > 0 && data.materials.some((m) => m.quantity > 0)
      case 3: // Energy
        return true // Optional fields
      case 4: // Transport
        return true // Has defaults
      default:
        return true
    }
  }

  const handleNext = async () => {
    if (currentStep === 4) {
      // Last input step - run calculation via backend API
      setCurrentStep(5)
      setIsCalculating(true)
      setCalculationError(null)

      try {
        const response = await fetch(`${API_URL}/demo/wizard`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            templateId: data.templateId,
            companyName: data.companyName,
            productName: data.productName,
            materials: data.materials.map((m) => ({
              id: m.id,
              name: m.name,
              quantity: m.quantity,
              unit: m.unit,
            })),
            electricityKwh: data.electricityKwh,
            heatKwh: data.heatKwh,
            supplierDistance: data.supplierDistance,
            customerDistance: data.customerDistance,
            transportMode: data.transportMode,
          }),
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const result = await response.json()
        setCalculationResult(result)
        setIsCalculating(false)
      } catch (error) {
        console.error('Calculation failed:', error)
        setCalculationError('Beräkningen misslyckades. Visar uppskattade värden.')
        setIsCalculating(false)
        // Don't set result - StepResults will use fallback calculation
      }
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, 5))
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepCompany data={data} onChange={updateData} />
      case 1:
        return <StepProduct data={data} onChange={updateData} />
      case 2:
        return <StepMaterials data={data} onChange={updateData} />
      case 3:
        return <StepEnergy data={data} onChange={updateData} />
      case 4:
        return <StepTransport data={data} onChange={updateData} />
      case 5:
        return (
          <StepResults
            data={data}
            isCalculating={isCalculating}
            backendResult={calculationResult}
            error={calculationError}
          />
        )
      default:
        return null
    }
  }

  return (
    <WizardShell
      currentStep={currentStep}
      onBack={currentStep > 0 && currentStep < 5 ? handleBack : undefined}
      onNext={currentStep < 5 ? handleNext : undefined}
      nextLabel={currentStep === 4 ? 'Se resultat' : 'Nästa'}
      nextDisabled={!canProceed()}
      hideNavigation={currentStep === 5}
    >
      {renderStep()}
    </WizardShell>
  )
}
