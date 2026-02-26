# TR/ACE — Claude Code Instructions

Du är en senior fullstack-utvecklare som bygger TR/ACE — en screening-LCA-plattform för svenska SME-tillverkare. Projektet är ett samarbete mellan Surprise Systems och SIS (Svenska institutet för standarder).

## Projektkontext

TR/ACE gör det möjligt för en SME-tillverkare att på 10 minuter få en ISO-kompatibel miljödeklaration som normalt kostar 200 000 kr och tar 6 veckor via konsult. Användaren matar in sin BOM (Bill of Materials), systemet beräknar 8 miljöindikatorer enligt ISO 14040-serien, och genererar ett delbart "hållbarhetsbevis" med QR-kod.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion
- **Backend**: FastAPI (Python), SQLModel, SQLite (demo), PostgreSQL (prod)
- **APIs**: Climatiq (emissionsfaktorer), OpenAI gpt-4o-mini (BOM-tolkning)
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
│   ├── Dashboard.tsx
│   ├── LoginPage.tsx
│   ├── AIBOMParser.tsx       # AI-driven BOM-inmatning
│   ├── AIChatWidget.tsx      # Chat-assistent
│   └── MaterialAutocomplete.tsx
```

### Backend-struktur (backend/)
```
backend/
├── main.py           # FastAPI endpoints, INDUSTRY_TEMPLATES
├── calculator.py     # LCA-beräkningsmotor (8 indikatorer)
├── climatiq_service.py  # Climatiq API-integration
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
| `GET /badge/{run_id}` | SVG-badge för delning |
| `GET /runs/{run_id}` | Beräkningsresultat (indikatorer, hotspots, rekommendationer) |
| `GET /templates` | Lista branschmallar |
| `GET /templates/{id}` | Hämta specifik mall med komponenter |
| `POST /products` | Skapa produkt |
| `POST /products/{id}/calculate` | Kör full LCA-beräkning |

### Befintliga branschmallar (INDUSTRY_TEMPLATES)
- `furniture` — Möbel (Kontorsstol)
- `food` — Livsmedel
- `workshop` — Verkstad

---

## Prioritetslista

### P1: Kritiskt för demo (denna sprint)

1. **Två nya branschmallar**
   - `construction`: "Bygg & Fastighet" — Byggelement (betong 15kg, stål 8kg, isolering 3kg). Transport road 200km inom SE. Ikon: 🏗️
   - `textile`: "Textil" — Plagg (bomull 0.3kg, polyester 0.15kg, färgning 2kWh). Ikon: 👕
   - Uppdatera även frontend demo-sidan med dessa som valbara kort

2. **PDF-export av certifikat**
   - Backend: `GET /certificate/{run_id}/pdf` (WeasyPrint med fallback)
   - A4-format med QR-kod, alla 8 indikatorer, antaganden, verifierings-ID
   - Frontend: "Ladda ner PDF"-knapp på certifikatsidan

3. **Mobilresponsivitet**
   - Demo: pain/roi/choose/result-stegen ska fungera på 375px bredd
   - Certifikat: grid ska stacka vertikalt på mobil
   - Landing: Hero, ROI-kalkylator, feature-grid

4. **"Skapa konto"-flöde**
   - Registreringssida (namn, email, företag, lösenord)
   - Spara demo-produkten till det nya kontot
   - Redirect till dashboard

5. **Freemium-logik**
   - `plan` fält på Organisation (free/starter/pro/enterprise)
   - Begränsningar: produkter (1/5/∞/∞), export (ingen/PDF/PDF+API/allt)
   - Visa plan-info i dashboard

6. **Dela certifikat**
   - "Kopiera länk"-knapp (finns delvis)
   - "Dela på LinkedIn"-knapp med pre-filled text
   - Verifiera OG-tags fungerar

7. **Jämför scenario**
   - Knapp "Vad händer om...?" på resultatsidan
   - Slider: "Öka återvunnet innehåll till X%"
   - Live-uppdatering av CO₂e (client-side)

### P2: Förbättringar

8. **Bättre onboarding**
   - Tooltip/guide för första användare
   - Progress-indikator i demo-flödet

9. **Spara utkast**
   - Auto-save under BOM-inmatning
   - "Fortsätt där du slutade"

10. **Export-format**
    - CSV-export av BOM + resultat
    - JSON-API för integration

### P3: Nice-to-have

11. **Analytics-dashboard (intern)**
    - Antal genomförda analyser
    - Totala kg CO₂ kartlagda
    - Populäraste branschen
    - Konvertering demo → konto

12. **Notifikationer**
    - Email vid klar analys

13. **Multi-language**
    - English toggle

---

## Kodstil

- TypeScript strict mode i frontend
- Python type hints i backend
- **Svenska** i all UI-text och kommentarer
- **Engelska** i variabelnamn och API-kontrakt
- Minimal abstraktion — hellre 10 rader tydlig kod än 100 rader "ren arkitektur"
- Testa med demo-flödet: landing → /demo → välj bransch → resultat → certifikat

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
