# 2030+ Calculator - Handover Documentation

## 🎯 Översikt
Detta är en LCA-kalkylator för SME-tillverkare som automatiskt beräknar klimatpåverkan med hjälp av **Climatiq API** och erbjuder AI-assisterad materialinmatning via **OpenAI**.

**Demo-produkt:** Kontorsstol Ergo Pro (realistiskt exempel för SME)

---

## 🚀 Snabbstart

### 1. Starta Servrar

**Backend (port 8002):**
```bash
cd backend
export CLIMATIQ_API_KEY=2JGXVZ7V3D04ZCH3167W9K97BM
venv/bin/uvicorn main:app --host 0.0.0.0 --port 8002 --reload
```

**Frontend (port 3031):**
```bash
cd app
pnpm dev -p 3031
```

### 2. Öppna Applikationen
Navigera till: **http://localhost:3031**

### 3. Logga In
- **Email:** `demo@skandiform.example`
- **Password:** `Demo123!`

---

## 📊 Demo-Flöde (Kontorsstol)

### Steg 1: Visa Befintlig Produkt
1. Klicka på "Kontorsstol Ergo Pro" i dashboarden
2. Se komponenter:
   - **Stålfot med hjul** (4.5 kg)
   - **Sits med skumstoppning** (2.2 kg)
   - **Ryggstöd** (1.8 kg)
   - **Gasdämpare** (0.6 kg)

### Steg 2: Kör Beräkning
1. Klicka "Kör beräkning enligt ISO 14040-serien"
2. Vänta 2-3 sekunder
3. Se resultat med **Climatiq-data**

### Förväntade Resultat:
- **Klimatpåverkan:** ~50-60 kg CO₂e (beroende på Climatiq-data)
- **Källa:** "Climatiq API (Live)" under Antaganden
- **Material:** Steel sheet, Polyurethane foam, Polyester fabric, Polypropylene

---

## 🔑 API-Nycklar

### Climatiq API
- **Nyckel:** `2JGXVZ7V3D04ZCH3167W9K97BM`
- **Plats:** `backend/.env.local`
- **Användning:** Automatisk CO₂e-beräkning för material

### OpenAI API
- **Nyckel:** `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`
- **Modell:** `gpt-4o-mini`
- **Plats:** `backend/.env.local`
- **Användning:** BOM-tolkning och materialförslag

---

## 🛠️ Teknisk Arkitektur

### Backend (FastAPI)
- **Port:** 8002
- **Databas:** SQLite (`backend/demo.db`)
- **Viktiga filer:**
  - `main.py` - API endpoints
  - `climatiq_service.py` - Climatiq integration
  - `ai_service.py` - OpenAI integration
  - `calculator.py` - LCA-beräkningar

### Frontend (Next.js 14)
- **Port:** 3031
- **Framework:** Next.js med TypeScript
- **Styling:** Tailwind CSS
- **API URL:** Konfigurerad i `app/.env.local`

---

## 📝 Vanliga Material (Climatiq-kompatibla)

För bästa resultat, använd dessa materialnamn:

### Metaller
- `steel sheet` - Stålplåt
- `aluminium` - Aluminium
- `stainless steel` - Rostfritt stål

### Plaster
- `polypropylene` - Polypropylen (PP)
- `polyethylene` - Polyeten (PE)
- `polyurethane foam` - PU-skum

### Textil
- `polyester fabric` - Polyestertyg
- `cotton fabric` - Bomullstyg
- `wool fabric` - Ulltyg

### Trä
- `plywood` - Plywood
- `particleboard` - Spånskiva
- `solid wood` - Massivt trä

---

## 🐛 Felsökning

### Problem: "Invalid credentials"
**Lösning:** Kontrollera att databasen är seedat:
```bash
cd backend
venv/bin/python seed.py
```

### Problem: "CORS error"
**Lösning:** Kontrollera att backend tillåter port 3031:
- Öppna `backend/main.py`
- Rad 47 ska innehålla `http://localhost:3031`

### Problem: "Climatiq API error"
**Lösning:** 
1. Verifiera API-nyckel i `backend/.env.local`
2. Testa med: `cd backend && venv/bin/python verify_climatiq.py`

### Problem: "AI parsing returns mock data"
**Lösning:**
1. Kontrollera OpenAI-nyckel i `backend/.env.local`
2. Verifiera modell är `gpt-4o-mini`
3. Testa med: `cd backend && venv/bin/python verify_ai.py`

---

## 📦 Deployment Tips

### För SIS-demon (1 dec 2025)
1. **Kör seed.py** innan demon för att återställa data
2. **Testa flödet** 5 min innan presentation
3. **Ha backup** - visa Python-skriptet `demo_flow.py` om UI krånglar

### För Produktion
1. Byt till produktions-databas (PostgreSQL rekommenderas)
2. Säkra API-nycklar med miljövariabler
3. Aktivera HTTPS
4. Konfigurera CORS för rätt domän

---

## 🎓 För SME-Användare

### Vad Gör Tjänsten?
Beräknar automatiskt klimatpåverkan (CO₂e) för dina produkter enligt ISO 14067.

### Varför Climatiq?
- **Aktuell data:** Uppdateras automatiskt
- **Certifierad:** Kompatibel med GHG Protocol och ISO 14067
- **Tid-besparande:** Slipper underhålla egen databas

### Typiska Användningsfall
1. **Produktutveckling:** Jämför olika materialval
2. **Rapportering:** CSRD, CBAM, EPD
3. **Marknadsföring:** Miljöcertifieringar

---

## 📞 Support

**Tekniska frågor:**
- Dokumentation: `walkthrough.md`
- Verifieringsskript: `backend/verify_*.py`
- Demo-skript: `backend/demo_flow.py`

**Nästa Steg:**
1. Läs `walkthrough.md` för fullständig genomgång
2. Kör `demo_flow.py` för att verifiera backend
3. Testa UI-flödet med demo-stolen

---

**Lycka till med demon! 🚀**
