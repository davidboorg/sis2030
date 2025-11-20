'use client'

import { motion } from 'framer-motion'
import { FileText, CheckCircle2 } from 'lucide-react'

const standards = [
  {
    code: 'ISO 14067',
    name: 'Klimatpåverkan',
    description: 'Kvantifiering och rapportering av koldioxidavtryck för produkter',
    scope: 'Cradle-to-gate analys av växthusgasutsläpp'
  },
  {
    code: 'ISO 14046',
    name: 'Vattenavtryck',
    description: 'Bedömning av vattenanvändning och dess miljöpåverkan',
    scope: 'Vattenförbrukning och vattenkvalitetspåverkan'
  },
  {
    code: 'ISO 14055',
    name: 'Markanvändning och biodiversitet',
    description: 'Bedömning av markanvändningens påverkan på biologisk mångfald',
    scope: 'Land use change och ekosystemtjänster'
  },
  {
    code: 'ISO 59004',
    name: 'Cirkulär ekonomi',
    description: 'Riktlinjer för bedömning av cirkularitet i produkters livscykel',
    scope: 'Återvunnet innehåll, återvinningspotential och materialeffektivitet'
  },
  {
    code: 'ISO 14040',
    name: 'LCA Framework',
    description: 'Allmänna principer och ramverk för livscykelanalys',
    scope: 'Metodologisk grund för alla miljöindikatorer'
  }
]

export default function Standards() {
  return (
    <section className="py-20 px-6 bg-sis-gray-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-sis-gray-900 mb-4">
            SME – vägen till SIS:s framtida relevans
          </h2>
          <p className="text-lg text-sis-gray-600 max-w-2xl mx-auto">
            2030+ Calculator digitaliserar internationella ISO-standarder för 
            praktisk tillämpning i svensk tillverkning – med särskilt fokus på små och medelstora företag.
          </p>
        </motion.div>

        <div className="bg-blue-50 p-6 rounded-lg mb-10">
          <h3 className="font-bold text-xl mb-4">Verkligt exempel: Skandiform AB</h3>
          <ul className="space-y-2 text-sis-gray-800 text-sm">
            <li>• 15 anställda i Tibro</li>
            <li>• Från 200,000 kr konsultkostnad → 2,000 kr/månad</li>
            <li>• Från 6 veckors analys → 10 minuter</li>
            <li>• Nu kan de möta offentlig upphandlings miljökrav</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {standards.map((standard, index) => (
            <motion.div
              key={standard.code}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-6 border border-sis-gray-200 hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-sis-pomegranate/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-sis-pomegranate" />
                </div>
                <div>
                  <div className="font-bold text-sis-gray-900 text-lg">{standard.code}</div>
                  <div className="text-sm text-sis-gray-600">{standard.name}</div>
                </div>
              </div>
              
              <p className="text-sm text-sis-gray-700 mb-3 leading-relaxed">
                {standard.description}
              </p>
              
              <div className="flex items-center gap-2 text-xs text-sis-gray-500">
                <CheckCircle2 className="w-4 h-4" />
                <span>{standard.scope}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

