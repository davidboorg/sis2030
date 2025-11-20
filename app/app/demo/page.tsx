import { ArrowRight } from 'lucide-react'

const demoProduct = {
  name: 'Köksstol Classic',
  company: 'Skandiform AB',
  employees: '15 anställda',
  location: 'Tibro, Sverige',
  components: [
    { name: 'Stomme i bok', quantity: 3.5, unit: 'kg', impact: 45 },
    { name: 'Sits i läder', quantity: 0.8, unit: 'kg', impact: 28 },
    { name: 'Skruv & beslag', quantity: 0.2, unit: 'kg', impact: 8 },
    { name: 'Transport', quantity: 50, unit: 'km', impact: 19 }
  ]
}

export default function DemoPage() {
  const totalImpact = demoProduct.components.reduce((sum, c) => sum + c.impact, 0)

  return (
    <main className="min-h-screen bg-sis-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        <header>
          <p className="text-sm uppercase tracking-wide text-sis-pomegranate mb-2">
            SME-demo
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-sis-gray-900 mb-2">
            Verkligt exempel: {demoProduct.company}
          </h1>
          <p className="text-sis-gray-600">
            {demoProduct.company} med {demoProduct.employees.toLowerCase()} i {demoProduct.location} använder 2030+ Calculator
            för att klimatberäkna produkten <span className="font-semibold">{demoProduct.name}</span>.
          </p>
        </header>

        <section className="bg-white rounded-2xl border border-sis-gray-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-semibold text-sis-gray-900">Produktöversikt</h2>
              <p className="text-sis-gray-600 text-sm">
                Enkel BoM med fyra rader – tillräckligt för att möta krav i offentlig upphandling.
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-wide text-sis-gray-500">
                Total klimatpåverkan
              </div>
              <div className="text-2xl font-bold text-sis-pomegranate">
                {totalImpact} kg CO₂e
              </div>
            </div>
          </div>

          <table className="w-full text-sm border-t border-sis-gray-200">
            <thead className="bg-sis-gray-50">
              <tr>
                <th className="text-left py-3 px-2 font-medium text-sis-gray-700">Komponent</th>
                <th className="text-right py-3 px-2 font-medium text-sis-gray-700">Mängd</th>
                <th className="text-right py-3 px-2 font-medium text-sis-gray-700">Andel av CO₂e</th>
              </tr>
            </thead>
            <tbody>
              {demoProduct.components.map(component => (
                <tr key={component.name} className="border-b border-sis-gray-100">
                  <td className="py-3 px-2 text-sis-gray-900">{component.name}</td>
                  <td className="py-3 px-2 text-right text-sis-gray-600">
                    {component.quantity} {component.unit}
                  </td>
                  <td className="py-3 px-2 text-right text-sis-gray-900">
                    {component.impact}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex items-center justify-between text-xs text-sis-gray-500">
            <span>Data i demon är förenklad men bygger på verkliga emissionsfaktorer för trä, läder och transport.</span>
            <span className="inline-flex items-center gap-1 text-sis-pomegranate font-medium">
              Visa full analys i systemet
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </section>
      </div>
    </main>
  )
}


