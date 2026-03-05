# TR/ACE Directory Structure

## Overview

```
SISSME/
├── app/                      # Frontend (Next.js 14)
│   ├── app/                  # App Router pages
│   │   ├── page.tsx          # Landing page
│   │   ├── globals.css       # Tailwind + CSS variables
│   │   ├── layout.tsx        # Root layout
│   │   ├── providers.tsx     # React Query provider
│   │   ├── demo/
│   │   │   ├── page.tsx      # Quick demo
│   │   │   └── wizard/
│   │   │       └── page.tsx  # 6-step wizard
│   │   ├── dashboard/
│   │   │   └── page.tsx      # Authenticated dashboard
│   │   ├── products/
│   │   │   └── [id]/
│   │   │       ├── page.tsx  # Product editor
│   │   │       └── results/
│   │   │           └── page.tsx
│   │   └── certificate/
│   │       └── [id]/
│   │           ├── page.tsx           # Server component
│   │           └── CertificateClient.tsx  # Client interactions
│   │
│   ├── components/
│   │   ├── landing/          # 10 landing page components
│   │   │   ├── Hero.tsx
│   │   │   ├── Benefits.tsx
│   │   │   ├── CustomerStories.tsx
│   │   │   ├── ROICalculator.tsx
│   │   │   ├── Standards.tsx
│   │   │   ├── SustainabilityBadge.tsx
│   │   │   ├── BadgeGallery.tsx
│   │   │   ├── Partners.tsx
│   │   │   └── Footer.tsx
│   │   │
│   │   ├── wizard/           # 7 wizard components
│   │   │   ├── WizardShell.tsx
│   │   │   ├── StepCompany.tsx
│   │   │   ├── StepProduct.tsx
│   │   │   ├── StepMaterials.tsx
│   │   │   ├── StepEnergy.tsx
│   │   │   ├── StepTransport.tsx
│   │   │   ├── StepResults.tsx
│   │   │   └── types.ts
│   │   │
│   │   ├── results/          # Results display
│   │   │   ├── ScopeDonut.tsx
│   │   │   ├── BenchmarkBar.tsx
│   │   │   ├── NextStepCards.tsx
│   │   │   └── ScenarioSlider.tsx
│   │   │
│   │   ├── Dashboard.tsx
│   │   ├── LoginPage.tsx
│   │   ├── AIBOMParser.tsx
│   │   ├── AIChatWidget.tsx
│   │   └── MaterialAutocomplete.tsx
│   │
│   ├── tailwind.config.js    # Design tokens
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                   # Backend (FastAPI)
│   ├── main.py               # FastAPI app + all endpoints
│   ├── calculator.py         # LCA calculation engine
│   ├── spend_calculator.py   # EEIO spend-based calc
│   ├── climatiq_service.py   # Climatiq API integration
│   ├── ai_service.py         # OpenAI BOM parsing
│   ├── models.py             # SQLModel schemas
│   ├── database.py           # DB connection setup
│   ├── demo_flow.py          # Demo-specific logic
│   ├── seed.py               # Database seeding
│   └── requirements.txt
│
├── packages/
│   └── shared/
│       └── factors.json      # Fallback emission factors
│
├── .planning/                 # Planning documentation
│   └── codebase/             # Codebase mapping
│
├── CLAUDE.md                 # Project instructions
├── package.json              # Root monorepo config
└── pnpm-workspace.yaml       # Workspace definition
```

## Key Locations

| Need to find... | Look in... |
|-----------------|------------|
| Landing page sections | `app/components/landing/` |
| Wizard flow | `app/components/wizard/` |
| API endpoints | `backend/main.py` |
| Database models | `backend/models.py` |
| LCA calculations | `backend/calculator.py` |
| Emission factors (fallback) | `packages/shared/factors.json` |
| Design tokens | `app/tailwind.config.js` |
| Industry templates | `backend/main.py` (INDUSTRY_TEMPLATES) |
| Benchmarks | `backend/main.py` (INDUSTRY_BENCHMARKS) |

## Naming Conventions

### Frontend

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `StepMaterials.tsx` |
| Hooks | camelCase + "use" | `useWizardData` |
| Types | PascalCase | `WizardData`, `Material` |
| Utils | camelCase | `updateData()` |
| CSS classes | kebab-case (Tailwind) | `trace-bg`, `sis-pomegranate` |
| Event handlers | "on" prefix | `onBack`, `onNext`, `onChange` |

### Backend

| Type | Convention | Example |
|------|------------|---------|
| Models | PascalCase | `Organisation`, `MaterialItem` |
| DB fields | snake_case | `org_id`, `dataset_ref`, `mass_kg` |
| Functions | snake_case | `calculate_indicators()` |
| API routes | snake_case / kebab | `/demo/wizard`, `/auth/login` |
| Env vars | UPPER_SNAKE | `CLIMATIQ_API_KEY`, `JWT_SECRET` |

### Database

| Type | Convention | Example |
|------|------------|---------|
| Tables | Auto-pluralized from model | `organisations`, `products` |
| Foreign keys | `{model}_id` | `org_id`, `component_id` |
| JSON columns | `{subject}_json` | `indicators_json`, `assumptions_json` |

## File Count by Area

| Directory | Files | Purpose |
|-----------|-------|---------|
| `app/components/landing/` | 10 | Landing page sections |
| `app/components/wizard/` | 8 | Wizard step components |
| `app/app/` | 10 | Page routes |
| `backend/` | 9 | Python modules |

## Configuration Files

| File | Purpose |
|------|---------|
| `app/tailwind.config.js` | Design system (colors, fonts) |
| `app/tsconfig.json` | TypeScript (strict: false) |
| `app/package.json` | Frontend dependencies |
| `backend/requirements.txt` | Backend dependencies |
| `pnpm-workspace.yaml` | Monorepo workspace |
| `.env.local` | Environment variables (gitignored) |
