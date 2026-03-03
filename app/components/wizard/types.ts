// Wizard data types for the demo flow

export type Industry = 'furniture' | 'food' | 'workshop' | 'construction' | 'textile'

export type Material = {
  id: string
  name: string
  quantity: number
  unit: 'kg' | 'kWh' | 'l'
  isDefault?: boolean
}

export type WizardData = {
  // Step 1: Company
  companyName: string
  industry: Industry | null
  location: string

  // Step 2: Product
  productName: string
  templateId: Industry | null

  // Step 3: Materials (BOM)
  materials: Material[]

  // Step 4: Energy
  electricityKwh: number
  heatKwh: number
  processEmissions: boolean

  // Step 5: Transport
  supplierDistance: number // km
  customerDistance: number // km
  transportMode: 'truck' | 'rail' | 'ship'
}

export const INITIAL_WIZARD_DATA: WizardData = {
  companyName: '',
  industry: null,
  location: '',
  productName: '',
  templateId: null,
  materials: [],
  electricityKwh: 0,
  heatKwh: 0,
  processEmissions: false,
  supplierDistance: 200,
  customerDistance: 100,
  transportMode: 'truck',
}

// Industry templates with default materials
export const INDUSTRY_TEMPLATES: Record<Industry, {
  name: string
  icon: string
  exampleProduct: string
  defaultMaterials: Material[]
  defaultElectricity: number
  defaultHeat: number
  context: string
}> = {
  furniture: {
    name: 'Möbel',
    icon: '🪑',
    exampleProduct: 'Kontorsstol Ergo Pro',
    context: 'Tibro, Tranås, Lammhult',
    defaultElectricity: 15,
    defaultHeat: 5,
    defaultMaterials: [
      { id: 'steel', name: 'Stål (stomme)', quantity: 5, unit: 'kg' },
      { id: 'foam', name: 'Skum (sits)', quantity: 2, unit: 'kg' },
      { id: 'textile', name: 'Textil (klädsel)', quantity: 1.5, unit: 'kg' },
      { id: 'plastic', name: 'Plast (detaljer)', quantity: 0.5, unit: 'kg' },
    ],
  },
  food: {
    name: 'Livsmedel',
    icon: '📦',
    exampleProduct: 'Förpackat livsmedel',
    context: 'Förpackning och logistik',
    defaultElectricity: 8,
    defaultHeat: 12,
    defaultMaterials: [
      { id: 'cardboard', name: 'Kartong', quantity: 0.3, unit: 'kg' },
      { id: 'plastic_film', name: 'Plastfilm', quantity: 0.05, unit: 'kg' },
      { id: 'pallet', name: 'Pall (andel)', quantity: 0.2, unit: 'kg' },
    ],
  },
  workshop: {
    name: 'Verkstad',
    icon: '⚙️',
    exampleProduct: 'CNC-bearbetad detalj',
    context: 'Underleverantör fordon/industri',
    defaultElectricity: 25,
    defaultHeat: 0,
    defaultMaterials: [
      { id: 'steel_raw', name: 'Stål (råmaterial)', quantity: 8, unit: 'kg' },
      { id: 'coolant', name: 'Kylvätska', quantity: 0.1, unit: 'l' },
      { id: 'coating', name: 'Ytbehandling', quantity: 0.05, unit: 'kg' },
    ],
  },
  construction: {
    name: 'Bygg & Fastighet',
    icon: '🏗️',
    exampleProduct: 'Byggelement',
    context: 'Prefab, stomme, element',
    defaultElectricity: 50,
    defaultHeat: 20,
    defaultMaterials: [
      { id: 'concrete', name: 'Betong', quantity: 15, unit: 'kg' },
      { id: 'steel_rebar', name: 'Armeringsstål', quantity: 8, unit: 'kg' },
      { id: 'insulation', name: 'Isolering', quantity: 3, unit: 'kg' },
    ],
  },
  textile: {
    name: 'Textil',
    icon: '👕',
    exampleProduct: 'Plagg (t-shirt)',
    context: 'Mode, arbetskläder, inredning',
    defaultElectricity: 3,
    defaultHeat: 5,
    defaultMaterials: [
      { id: 'cotton', name: 'Bomull', quantity: 0.3, unit: 'kg' },
      { id: 'polyester', name: 'Polyester', quantity: 0.15, unit: 'kg' },
      { id: 'dye', name: 'Färgning (energi)', quantity: 2, unit: 'kWh' },
    ],
  },
}

// Swedish cities for location autocomplete
export const SWEDISH_CITIES = [
  'Stockholm', 'Göteborg', 'Malmö', 'Uppsala', 'Linköping',
  'Örebro', 'Västerås', 'Helsingborg', 'Norrköping', 'Jönköping',
  'Umeå', 'Lund', 'Borås', 'Sundsvall', 'Gävle',
  'Tibro', 'Tranås', 'Lammhult', 'Eslöv', 'Kinna',
]
