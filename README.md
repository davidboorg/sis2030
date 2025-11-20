# 2030+ Calculator - Digitalisering av hållbarhetsstandarder

## Översikt

2030+ Calculator digitaliserar ISO-hållbarhetsstandarder (ISO 14067, 14046, 14055, 59004) för Svenska institutet för standarder (SIS). Systemet gör internationella standarder praktiskt tillämpbara för svenska tillverkningsföretag genom digital livscykelanalys och cirkuläritetsbedömning.

## Funktioner

- **8 miljöindikatorer** enligt ISO-standarder (inkl. biodiversitet och cirkularitet)
- **ISO-kompatibel beräkning** enligt ISO 14040-serien
- **BOM-byggare** med hierarkisk komponentstruktur
- **AI-stöd** för materialmatching och förbättringsförslag
- **ISO-rapporter** med metodbilaga

## Teknisk stack

- **Frontend**: Next.js 14 (TypeScript), Tailwind CSS, Framer Motion
- **Backend**: FastAPI (Python), SQLModel, SQLite
- **Design**: SIS Pomegranate (#F32735), nordisk minimalism

## Installation

```bash
# 1. Installera pnpm globalt
npm install -g pnpm

# 2. Installera frontend-beroenden
pnpm install

# 3. Sätt upp Python virtual environment
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 4. Installera backend-beroenden
pip install -r requirements.txt

# 5. Seed databas med demo-data
python seed.py

# 6. Gå tillbaka till root
cd ..

# 7. Starta både frontend och backend
pnpm dev
```

## Kör lokalt

- **Frontend**: http://localhost:3030 (eller http://127.0.0.1:3030)
- **Backend API**: http://localhost:8001
- **API-dokumentation**: http://localhost:8001/docs

## Projektstruktur

```
2030-calculator/
├── app/                    # Next.js 14 frontend
│   ├── app/               # App Router
│   │   ├── page.tsx      # Landing page
│   │   ├── dashboard/    # Dashboard
│   │   └── products/     # Produktanalyser
│   └── components/       # React-komponenter
│
├── backend/               # FastAPI backend
│   ├── main.py          # API endpoints
│   ├── models.py        # Datamodeller
│   ├── calculator.py    # LCA-beräkningar
│   └── seed.py          # Demo-data
│
├── packages/shared/      # Delade resurser
│   └── factors.json     # Miljöfaktorer
│
└── design/              # Designresurser
    └── theme.ts         # Design tokens
```

## Demo-konto

- **E-post**: demo@skandiform.example
- **Lösenord**: Demo123!

## Demo för SIS - Måndag

### Öppning:

"Vi visar hur Skandiform AB med 15 anställda i Tibro kan använda samma ISO-verktyg som IKEA - men för 2,000 kr/månad istället för 200,000 kr i konsultkostnad"

### Huvudbudskap:

- 95% av svenska företag är SME
- De har samma miljökrav men inte samma resurser
- 2030+ Calculator demokratiserar hållbarhetsdata
- SIS blir navet mellan SME och storföretag

### Avslutning:

"När möbeltillverkaren i Tibro, bagaren i Lund och verkstaden i Gällivare kan dokumentera sin miljöpåverkan - då har SIS verkligen gått från standard till handling"

## ISO-standarder

Systemet implementerar:
- **ISO 14067** - Klimatpåverkan (Carbon footprint)
- **ISO 14046** - Vattenavtryck (Water footprint)
- **ISO 14055** - Markanvändning och biodiversitet
- **ISO 59004** - Cirkulär ekonomi
- **ISO 14040** - LCA Framework (metodologisk grund)

## Miljöindikatorer

1. Klimatpåverkan (kg CO₂e) - ISO 14067
2. Vattenförbrukning (L) - ISO 14046
3. Energianvändning (MJ) - ISO 50001
4. Markanvändning (m²·år) - ISO 14055
5. Försurning (mol H⁺-eq) - ISO 14040
6. Övergödning (g PO₄³⁻-eq) - ISO 14040
7. Biodiversitet (index 0-1) - ISO 14055
8. Cirkularitet (%) - ISO 59004

## Licens

© 2024 Svenska institutet för standarder. Alla rättigheter förbehållna.


