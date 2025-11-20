# 2030+ Calculator

LCA-kalkylator för SME-tillverkare med automatisk klimatberäkning via **Climatiq API** och AI-assisterad materialinmatning via **OpenAI**.

## 🎯 Features

- **Climatiq Integration** - Automatisk CO₂e-beräkning med live emission factors
- **OpenAI BOM Parser** - AI-tolkad materialinmatning från naturligt språk
- **ISO-kompatibel** - Följer ISO 14040, 14067, 14046, 14055, 59004
- **SME-optimerad** - Enkel att använda för små/medelstora tillverkare
- **Realistisk demo** - Kontorsstol "Ergo Pro" med verkliga material

## 🚀 Quick Start

**Fullständig setup-guide:** Se [HANDOVER.md](HANDOVER.md)

### Backend (Port 8002)
```bash
cd backend
export CLIMATIQ_API_KEY=your_key_here
venv/bin/uvicorn main:app --host 0.0.0.0 --port 8002 --reload
```

### Frontend (Port 3031)
```bash
cd app
pnpm dev -p 3031
```

### Demo-inloggning
- **Email:** `demo@skandiform.example`
- **Password:** `Demo123!`

## 📊 Demo-Produkt

**Kontorsstol Ergo Pro**
- Stålfot med hjul (4.5 kg)
- Sits med skumstoppning (2.2 kg)
- Ryggstöd (1.8 kg)
- Gasdämpare (0.6 kg)

**Resultat:** ~17-60 kg CO₂e (beroende på Climatiq-data)

## 📝 Dokumentation

- **[HANDOVER.md](HANDOVER.md)** - Komplett setup & deployment-guide
- **[MATERIAL_GUIDE.md](MATERIAL_GUIDE.md)** - Climatiq-kompatibla materialnamn
- **[walkthrough.md](.gemini/antigravity/brain/.../walkthrough.md)** - Teknisk genomgång av integrationen

## 🔑 API Keys (Krävs)

Skapa `backend/.env.local` och `app/.env.local`:

```bash
# backend/.env.local
CLIMATIQ_API_KEY=din_climatiq_nyckel
OPENAI_API_KEY=din_openai_nyckel
OPENAI_MODEL=gpt-4o-mini
```

```bash
# app/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8002
```

**⚠️ VIKTIGT:** Lägg ALDRIG API-nycklar i Git! De är skyddade av `.gitignore`.

## 📦 Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLModel** - SQL databas med Pydantic-modeller
- **Climatiq API** - Emission factor database
- **OpenAI API** - BOM parsing & material suggestions

### Frontend
- **Next.js 14** - React framework med TypeScript
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - Component library

## 🛠️ Verifiering

```bash
# Testa backend API
cd backend
venv/bin/python demo_flow.py

# Testa Climatiq integration
venv/bin/python verify_climatiq.py

# Testa AI service
venv/bin/python verify_ai.py
```

## 📄 Projektstruktur

```
2030-calculator/
├── backend/          # FastAPI backend
│   ├── main.py       # API endpoints
│   ├── climatiq_service.py
│   ├── ai_service.py
│   ├── calculator.py
│   └── seed.py       # Demo data
├── app/              # Next.js frontend
│   ├── app/          # Pages
│   └── components/   # React components
├── packages/         # Shared resources
└── HANDOVER.md       # Setup guide
```

## 🎓 För SME-Användare

### Vad Gör Tjänsten?
Beräknar automatiskt klimatpåverkan (CO₂e) för dina produkter enligt ISO 14067.

### Varför Climatiq?
- **Aktuell data** - Uppdateras automatiskt
- **Certifierad** - Kompatibel med GHG Protocol och ISO 14067
- **Tid-besparande** - Slipper underhålla egen databas

### Typiska Användningsfall
1. **Produktutveckling** - Jämför olika materialval
2. **Rapportering** - CSRD, CBAM, EPD
3. **Marknadsföring** - Miljöcertifieringar

## 📞 Support

**Tekniska frågor:**
- Dokumentation: `HANDOVER.md`
- Verifieringsskript: `backend/verify_*.py`
- Demo-skript: `backend/demo_flow.py`

## 📄 License

[Lägg till din licens här]

---

**Utvecklat för SIS (Swedish Standards Institute) - Demo 1 December 2025**
