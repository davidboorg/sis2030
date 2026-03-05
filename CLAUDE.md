# TR/ACE — Claude Code Instructions

Du är en senior fullstack-utvecklare som bygger TR/ACE — en screening-LCA-plattform för svenska SME-tillverkare. Projektet är ett samarbete mellan Surprise Systems och SIS (Svenska institutet för standarder).

## Projektkontext

TR/ACE gör det möjligt för en SME-tillverkare att på 10 minuter få en ISO-kompatibel miljödeklaration som normalt kostar 200 000 kr och tar 6 veckor via konsult. Användaren matar in sin BOM (Bill of Materials), systemet beräknar 8 miljöindikatorer enligt ISO 14040-serien, och genererar ett delbart "hållbarhetsbevis" med QR-kod.

**Referensprodukt:** Doconomys SME Carbon Calculator (byggt åt Bank of America). Vi tar de bästa UX-mönstren därifrån — specifikt: spend-baserad input, steg-för-steg wizard, scope-visualisering, bransch-benchmarking, och post-resultat-ekosystem — men applicerar det på produktnivå-LCA istället för företagsnivå-carbon footprint.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion
- **Backend**: FastAPI (Python), SQLModel, SQLite (demo), PostgreSQL (prod)
- **APIs**: Climatiq (emissionsfaktorer + EEIO spend-based), OpenAI gpt-4o-mini (BOM-tolkning)
- **Design**: Mörkt tema, SIS Pomegranate (#F32735), nordisk minimalism

---

## Designsystem — TR/ACE Brand

Använd ALLTID dessa Tailwind-klasser (definierade i `app/tailwind.config.js`):

### Färger

| Variabel | Hex | Användning |
|----------|-----|------------|
| `trace-bg` | #0F172A | Huvudbakgrund |
| `trace-surface` | #1E293B | Kort, panels |
| `trace-surface-2` | #334155 | Sekundär yta, hover |
| `trace-border` | #1E293B | Kantlinjer |
| `trace-border-light` | #334155 | Ljusare kantlinjer |
| `trace-text` | #F8FAFC | Primär text |
| `trace-text-secondary` | #94A3B8 | Sekundär text |
| `trace-text-muted` | #64748B | Dämpad text, labels |
| `sis-pomegranate` | #F32735 | **Accent** — CTA, rubriker, hover |
| `sis` | #E3000F | Authority red — ISO-refs, legal |
| `verified-dot` | #F32735 | Verifierings-indikator |

### Typografi

| Klass | Font | Användning |
|-------|------|------------|
| `font-display` | Cormorant | Rubriker, hero-text |
| `font-sans` | Instrument Sans | Brödtext |
| `font-mono` | DM Mono | Siffror, labels, metadata, eyebrows |

### Eyebrow-labels (återkommande mönster)
```html
<span class="font-mono text-[10px] tracking-[0.2em] uppercase text-sis-pomegranate">
  Label här
</span>
```

### Designmönster

- **Accentlinje**: 3px pomegranate gradient längst upp på kort
  ```html
  <div class="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-sis-pomegranate to-transparent" />
  ```
- **Gap-grid**: `gap-px bg-trace-border` för 1px-linjer mellan kort
- **Animationer**: Framer Motion (fade + slide up, 0.4-0.6s)
- **Hover på kort**: `hover:bg-trace-surface-2`, text → `hover:text-sis-pomegranate`
- **CTA-knappar**: `bg-sis-pomegranate text-white hover:bg-red-600`

---

## Arkitektur

### Frontend-struktur (app/)
```
app/
├── app/
│   ├── page.tsx              # Landing page (komposit av landing-komponenter)
│   ├── globals.css           # Tailwind + CSS-variabler
│   ├── demo/page.tsx         # "Prova utan konto"-flöde
│   ├── dashboard/page.tsx    # Inloggad dashboard
│   ├── products/[id]/        # Produktdetalj + BOM-editor
│   │   └── results/page.tsx  # Resultat efter beräkning
│   └── certificate/[id]/     # Delbar certifikatsida med OG-tags
│       ├── page.tsx          # Server component
│       └── CertificateClient.tsx  # Client interaktioner
├── components/
│   ├── landing/              # Hero, Benefits, ROI, CustomerStories, etc.
│   │   ├── Hero.tsx
│   │   ├── Benefits.tsx
│   │   ├── CustomerStories.tsx
│   │   ├── ROICalculator.tsx
│   │   ├── Standards.tsx
│   │   ├── SustainabilityBadge.tsx
│   │   ├── BadgeGallery.tsx
│   │   ├── Partners.tsx
│   │   └── Footer.tsx
│   ├── wizard/               # NYT: Steg-för-steg wizard-komponenter
│   │   ├── WizardShell.tsx   # Layout: progress bar, back/next, save & exit
│   │   ├── StepCompany.tsx   # Steg 1: Företagsprofil
│   │   ├── StepProduct.tsx   # Steg 2: Välj produkt/branschmall
│   │   ├── StepMaterials.tsx # Steg 3: Material (vikt ELLER spend)
│   │   ├── StepEnergy.tsx    # Steg 4: Tillverkning & energi
│   │   ├── StepTransport.tsx # Steg 5: Transport & logistik
│   │   └── StepResults.tsx   # Steg 6: Resultat + scope-donut + benchmark + CTA
│   ├── results/              # NYT: Resultat-komponenter
│   │   ├── ScopeDonut.tsx    # Scope 1/2/3 donut-diagram (Recharts)
│   │   ├── BenchmarkBar.tsx  # Horisontell jämförelse mot branschsnitt
│   │   ├── NextStepCards.tsx # 4 action-kort (badge, förbättra, jämför, dela)
│   │   └── ScenarioSlider.tsx# "Vad händer om...?" slider
│   ├── Dashboard.tsx
│   ├── LoginPage.tsx
│   ├── AIBOMParser.tsx       # AI-driven BOM-inmatning
│   ├── AIChatWidget.tsx      # Chat-assistent
│   └── MaterialAutocomplete.tsx
```

### Backend-struktur (backend/)
```
backend/
├── main.py           # FastAPI endpoints, INDUSTRY_TEMPLATES, INDUSTRY_BENCHMARKS
├── calculator.py     # LCA-beräkningsmotor (8 indikatorer + scope-breakdown)
├── spend_calculator.py  # NYT: EEIO spend-baserad beräkning
├── climatiq_service.py  # Climatiq API-integration (process + EEIO)
├── ai_service.py     # OpenAI för BOM-parsing
├── models.py         # SQLModel: User, Organisation, Product, Component, etc.
├── database.py       # SQLite/PostgreSQL setup
├── demo_flow.py      # Demo-specifik logik
└── seed.py           # Demo-data (Skandiform AB + Kontorsstol Ergo Pro)
```

### Nyckel-endpoints

| Endpoint | Beskrivning |
|----------|-------------|
| `POST /demo/{template_id}` | Kör demo-beräkning utan konto |
| `POST /demo/spend` | **NYT**: Kör spend-baserad demo-beräkning |
| `GET /badge/{run_id}` | SVG-badge för delning |
| `GET /runs/{run_id}` | Beräkningsresultat (indikatorer, hotspots, scope-breakdown, benchmark) |
| `GET /runs/{run_id}/scopes` | **NYT**: Scope 1/2/3 breakdown |
| `GET /benchmark/{template_id}` | **NYT**: Branschsnitt för jämförelse |
| `GET /templates` | Lista branschmallar |
| `GET /templates/{id}` | Hämta specifik mall med komponenter |
| `POST /products` | Skapa produkt |
| `POST /products/{id}/calculate` | Kör full LCA-beräkning |
| `GET /certificate/{run_id}/pdf` | PDF-export av certifikat |

### Befintliga branschmallar (INDUSTRY_TEMPLATES)
- `furniture` — Möbel (Kontorsstol)
- `food` — Livsmedel
- `workshop` — Verkstad

### Nya branschmallar att lägga till
- `construction` — Bygg & Fastighet (betong 15kg, stål 8kg, isolering 3kg)
- `textile` — Textil (bomull 0.3kg, polyester 0.15kg, färgning 2kWh)

### Bransch-benchmarks (INDUSTRY_BENCHMARKS — nytt)
```python
INDUSTRY_BENCHMARKS = {
    "furniture": {"avg_co2e": 18.2, "best_co2e": 8.1, "unit": "kg CO₂e/stol"},
    "food": {"avg_co2e": 3.5, "best_co2e": 1.2, "unit": "kg CO₂e/kg produkt"},
    "workshop": {"avg_co2e": 45.0, "best_co2e": 22.0, "unit": "kg CO₂e/detalj"},
    "construction": {"avg_co2e": 120.0, "best_co2e": 65.0, "unit": "kg CO₂e/element"},
    "textile": {"avg_co2e": 8.5, "best_co2e": 3.2, "unit": "kg CO₂e/plagg"},
}
```

---

## Prioritetslista

### P0: UX-revolution — "Doconomy-nivå paketering"

> Doconomys SME Calculator (Bank of America) är vår UX-referens.
> Allt nedan handlar om att ta TR/ACE från "fungerande prototyp" till "wow".

#### 0A) Steg-för-steg wizard med progress bar

Byt ut nuvarande demo-flöde mot en clean wizard (6 steg):

```
Steg 1: Företagsprofil     → Företagsnamn, bransch, ort (1 vy, 3 fält)
Steg 2: Välj produkt       → Branschmall ELLER "Egen produkt" (1 vy, 1 val)
Steg 3: Material & vikt    → Förifyllda exempelvärden, justera det som avviker
Steg 4: Tillverkning       → Energi (kWh) med branschstandard som default
Steg 5: Transport           → Varifrån och vart (dropdown med vanliga rutter)
Steg 6: Resultat            → Scope-donut + indikatorer + benchmark + CTA
```

**Designprinciper:**
- **En fråga per vy** — aldrig scrolla
- **Progress bar längst ner**: `Steg 3 / 6` med pomegranate fill
- **Save & Exit** synlig på varje steg
- **Back** till vänster, **Nästa** till höger (pomegranate CTA)
- **Förifyllda exempelvärden** i alla fält med `bg-trace-surface-2` bakgrund
  - Användaren ser "5 kg", "150 kWh", "200 km" som utgångspunkt
  - Bara ändra det som avviker — dramatiskt lägre friktion

#### 0B) Spend-baserad input som alternativ väg in

Dubbelt inmatningsläge i Steg 3:

**Vikt-läge** (befintligt, för den som har BOM-data):
```
Stål:     [  5  ] kg
Textil:   [  2  ] kg
Skum:     [  1  ] kg
```

**Spend-läge** (nytt, för den som har fakturor):
```
Stålkomponenter:  [ 1,200 ] kr
Textilklädsel:    [   800 ] kr
Skumdetaljer:     [   400 ] kr
```

Toggle mellan lägena med tabs: `⚖️ Vikt` | `💰 Utgifter`

**Backend:**
- Climatiq EEIO-faktorer: `procurement/[category]`
- `spend_calculator.py`: konverterar SEK → CO₂e via EEIO
- Resultat markeras: "Baserat på utgiftsdata (±30% osäkerhet)"
- Nudge: "Vill du förbättra precisionen? Ange vikter istället."

#### 0C) Scope 1/2/3 visualisering

Resultatvyn ska ha en prominent donut-diagram:

- **Scope 1** (grön): Intern tillverkning (process-emissioner)
- **Scope 2** (blå): El- och värmeförbrukning
- **Scope 3** (orange): Material upstream + transport

Stort huvudtal: `12.4 kg CO₂e` — tar upp 40% av bredden.
Donut med scope-breakdown till höger.
Animerad inräkning med Framer Motion.

Implementera med Recharts `<PieChart>` eller D3.

#### 0D) Bransch-benchmarking

Horisontella jämförelse-bars under scope-donuten:

```
Din produkt:     12.4 kg  ████████░░░░░░░░
Branschsnitt:    18.2 kg  ████████████░░░░
Bäst i klassen:   8.1 kg  █████░░░░░░░░░░░
```

Dynamisk copy:
- Under snitt: "Du ligger **32% under** branschsnittet! 🎉"
- Över snitt: "Du ligger **15% över** branschsnittet. Se rekommendationer nedan."
- Nära bäst: "Nästan bäst i klassen! Byt till återvunnet stål för att nå dit."

#### 0E) Post-resultat nästa-steg-kort

Fyra action-kort i ett 2×2 grid efter resultatvyn:

| Kort | Titel | Beskrivning | CTA |
|------|-------|-------------|-----|
| 📄 | Hållbarhetsbevis | Ladda ner badge + PDF för anbud | Ladda ner → |
| 📊 | Förbättra | "Vad händer om jag byter material?" | Testa scenario → |
| 🏆 | Jämför | Se ranking mot branschsnittet | Se benchmark → |
| 🔗 | Dela | LinkedIn, kopiera länk, bädda in | Dela nu → |

#### 0F) Copywriting — sälj resan, inte verktyget

| Idag (tekniskt) | Nytt (affärsspråk) |
|---|---|
| "Screening-LCA-kalkylator" | "Ditt hållbarhetsbevis börjar här" |
| "8 miljöindikatorer" | "Allt din kund vill veta om din produkt" |
| "ISO 14040-kompatibel" | "Godkänd för offentlig upphandling" |
| "Cradle-to-gate analys" | "Från råmaterial till leverans — automatiskt" |
| "Beräkna" (knapptext) | "Se ditt resultat" |
| "Mata in BOM" | "Beskriv din produkt" |
| Tom input utan hint | Förifyllt exempelvärde i ljus bakgrund |

---

### P1: Kritiskt för demo (denna sprint)

1. **Två nya branschmallar** — `construction` och `textile` (se ovan)

2. **PDF-export av certifikat**
   - Backend: `GET /certificate/{run_id}/pdf` (WeasyPrint med fallback)
   - A4, QR-kod, alla 8 indikatorer, scope-breakdown, antaganden, verifierings-ID
   - Frontend: "Ladda ner PDF"-knapp på certifikatsidan

3. **Mobilresponsivitet**
   - Wizard-steg ska fungera på 375px bredd
   - Certifikat: grid stackar vertikalt
   - Landing: Hero, ROI-kalkylator, feature-grid

4. **"Skapa konto"-flöde**
   - Registreringssida (namn, email, företag, lösenord)
   - Spara demo-produkten till kontot
   - Redirect till dashboard

5. **Freemium-logik**
   - `plan` på Organisation (free/starter/pro/enterprise)
   - Begränsa: produkter (1/5/∞/∞), export (ingen/PDF/PDF+API/allt)
   - Plan-info i dashboard

6. **Dela certifikat**
   - "Kopiera länk", "Dela på LinkedIn" (pre-filled text)
   - Verifiera OG-tags

7. **Scenario-jämförelse**
   - "Vad händer om...?" knapp
   - Slider: "Öka återvunnet innehåll till X%"
   - Live CO₂e-uppdatering client-side

### P2: Förbättringar

8. **Save & Exit / Spara utkast**
   - Auto-save i localStorage (demo) eller DB (inloggad)
   - "Fortsätt där du slutade"
   - Toast: "Utkast sparat"

9. **Data-import**
   - Excel/CSV-upload av BOM
   - AI-driven kolumnmappning
   - Framtid: Fortnox/Visma-integration

10. **Export-format**
    - CSV av BOM + resultat
    - JSON-API

### P3: Nice-to-have

11. **Analytics-dashboard (intern)**
12. **Email-notifikationer**
13. **Multi-language (English)**

---

## Kodstil

- TypeScript strict mode i frontend
- Python type hints i backend
- **Svenska** i all UI-text och kommentarer
- **Engelska** i variabelnamn och API-kontrakt
- Minimal abstraktion — hellre 10 rader tydlig kod än 100 rader "ren arkitektur"
- Testa med demo-flödet: landing → /demo → wizard → resultat → certifikat

## Viktiga regler

- ALDRIG commita API-nycklar (.env.local är gitignored)
- Alla beräkningar ska fungera utan Climatiq-nyckel (fallback till `backend/factors.json`)
- SQLite för dev, PostgreSQL för prod — SQLModel abstraherar
- WeasyPrint kan vara svårt att installera — ha alltid en fallback (HTML-export)
- Alla demo-produkter prefixas med `[Demo]` i databasen
- **Behåll det enkelt. Ship fast. Vi itererar efter piloter.**

## Köra projektet

```bash
# Terminal 1: Frontend
cd app && pnpm dev  # http://localhost:3030

# Terminal 2: Backend
cd backend && source venv/bin/activate && uvicorn main:app --reload --port 8001
```

Eller från root:
```bash
pnpm dev  # Kör båda via concurrently (kräver aktiverad venv)
```
