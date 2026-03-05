# TR/ACE Architecture

## Pattern & Layers

TR/ACE is a **full-stack Next.js + FastAPI application** with clear separation:

```
┌─────────────────────────────────────────┐
│           Frontend (Next.js 14)         │
│  ├── Presentation: React components     │
│  ├── State: React hooks + React Query   │
│  └── Styling: Tailwind CSS              │
├─────────────────────────────────────────┤
│            Backend (FastAPI)            │
│  ├── API Layer: RESTful endpoints       │
│  ├── Business Logic: Calculator, AI     │
│  └── Data Layer: SQLModel ORM           │
├─────────────────────────────────────────┤
│          External Services              │
│  ├── Climatiq: Emission factors         │
│  └── OpenAI: BOM parsing                │
└─────────────────────────────────────────┘
```

## Data Flow

### Landing Page Flow
```
app/page.tsx
├── Hero
├── Benefits
├── Steps
├── Standards
├── ROICalculator
├── SustainabilityBadge
├── BadgeGallery
├── CustomerStories
├── Indicators
├── Partners
└── Footer
```

### Wizard Demo Flow (Primary UX)
```
app/demo/wizard/page.tsx (WizardDemoPage)
├── State: WizardData (company, product, materials, energy, transport)
├── Step 0: StepCompany → companyName, industry, location
├── Step 1: StepProduct → templateId selection
├── Step 2: StepMaterials → Materials[] (Weight OR Spend mode)
├── Step 3: StepEnergy → electricityKwh, heatKwh
├── Step 4: StepTransport → distances, mode
├── Step 5: StepResults → POST /demo/wizard
│   └── Displays: ScopeDonut, BenchmarkBar, NextStepCards
└── Certificate: /certificate/{run_id}
```

### Backend Calculation Pipeline
```
POST /demo/wizard (Frontend)
│
├── demo_flow.py: create_demo_run()
│   ├── Create Product
│   ├── Create Components from materials
│   ├── Assign MaterialItems, ProcessItems, TransportItems
│   └── Trigger calculate_indicators()
│
├── calculator.py: calculate_indicators()
│   ├── Fetch Components → Items
│   ├── Try Climatiq API first
│   ├── Fallback to local factors.json
│   ├── Calculate 8 indicators:
│   │   ├── co2e_kg
│   │   ├── water_l
│   │   ├── energy_mj
│   │   ├── land_m2a
│   │   ├── acid_mol_hplus
│   │   ├── eutro_g_po4
│   │   ├── biodiversity_index
│   │   └── circularity_pct
│   ├── Scope breakdown (1, 2, 3)
│   ├── Identify hotspots
│   └── Generate recommendations
│
└── Response: CalculationResult
    ├── indicators{}
    ├── hotspots[]
    ├── scopes{}
    ├── benchmark{}
    └── product_id, run_id
```

## Key Abstractions

### WizardData Type (Frontend State)
**Location**: `app/components/wizard/types.ts`
```typescript
type WizardData = {
  companyName, industry, location,
  productName, templateId,
  materials[],
  electricityKwh, heatKwh, processEmissions,
  supplierDistance, customerDistance, transportMode
}
```

### Industry Templates
**Location**: `app/components/wizard/types.ts`

| Template | Materials |
|----------|-----------|
| furniture | Stål (5kg), Skum (2kg), Textil (1.5kg), Plast (0.5kg) |
| food | Kartong (0.3kg), Plastfilm (0.05kg), Pall (0.2kg) |
| workshop | Stål råmaterial (8kg), Kylvätska (0.1l) |
| construction | Betong (15kg), Armeringsstål (8kg), Isolering (3kg) |
| textile | Bomull (0.3kg), Polyester (0.15kg), Färgning (2kWh) |

### SQLModel Database Schema
**Location**: `backend/models.py`
```
Organisation
├── User
├── Product
│   ├── Component
│   │   ├── MaterialItem
│   │   ├── ProcessItem
│   │   └── TransportItem
│   └── Run
│       └── RunResult
├── License
├── Dataset
└── Report
```

### Calculation Factors
**Location**: `packages/shared/factors.json`
```json
{
  "materials": { "steel": {...}, "cotton": {...} },
  "processes": { "electricity_grid_se": {...} },
  "transport": { "truck_freight": {...} }
}
```

## Entry Points

### Frontend
| Path | Purpose |
|------|---------|
| `app/page.tsx` | Landing page |
| `app/demo/wizard/page.tsx` | 6-step wizard |
| `app/certificate/[id]/page.tsx` | Shareable results |
| `app/dashboard/page.tsx` | Authenticated view (stub) |
| `app/products/[id]/page.tsx` | Product editor (stub) |

### Backend
| Endpoint | Purpose |
|----------|---------|
| `POST /demo/wizard` | Main calculation |
| `GET /certificate/{id}/pdf` | PDF export |
| `POST /runs` | Full LCA calculation |
| `GET /runs/{id}` | Fetch results |
| `POST /auth/login` | Authentication |

### Services
| File | Purpose |
|------|---------|
| `climatiq_service.py` | Emission factor lookup |
| `ai_service.py` | BOM parsing |
| `calculator.py` | 8-indicator computation |
| `database.py` | Session management |

## Results Component Hierarchy
```
StepResults
├── ScopeDonut (Recharts PieChart)
│   └── Scope 1 (green), Scope 2 (blue), Scope 3 (orange)
├── BenchmarkBar
│   └── Your product vs Average vs Best in class
├── AllIndicators (8 cards)
├── Hotspots List
├── NextStepCards (2x2 grid)
│   ├── Hållbarhetsbevis
│   ├── Förbättra
│   ├── Jämför
│   └── Dela
└── Certificate Link
```
