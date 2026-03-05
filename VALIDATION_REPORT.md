# TR/ACE — Kodgranskning & Valideringsrapport

**Datum:** 2026-03-03
**Granskare:** Claude (Cowork)
**Scope:** Fullständig genomgång av backend + frontend + beräkningslogik

---

## Övergripande bedömning: Dela med noterade förbehåll

Projektet är en solid MVP med genomtänkt arkitektur och ett imponerande UX-flöde. Beräkningslogiken fungerar korrekt med lokala faktorer, men det finns ett antal issues — varav några kan påverka resultatens trovärdighet vid demo.

---

## Kritiska issues (måste fixas)

### 1. [HÖG] CO₂e-dubbelräkning vid Climatiq + lokala faktorer

**Fil:** `backend/calculator.py` rad 107-113

Koden har en `pass`-sats som ska hoppa över lokal CO₂e vid Climatiq-användning, men raden `indicators[indicator] += impact` på rad 112 körs **oavsett** — CO₂e adderas dubbelräknat till `indicators` under iterationen, och skrivs sedan över med Climatiq-värdet på rad 151.

**Problem:** Under beräkningen byggs `component_contributions` med lokala CO₂e-värden, men `indicators["co2e_kg"]` skrivs över med Climatiq-totalen. Hotspot-procentandelarna beräknas sedan mot Climatiq-totalen men med lokala komponentvärden — de summerar inte till 100%.

**Fix:** Antingen distribuera Climatiq-totalen proportionellt mot komponenterna, eller beräkna hotspots från `component_contributions` summerat till 100% oberoende av den globala totalen.

### 2. [HÖG] Wizard-resultat är klient-simulerade, inte backend-beräknade

**Fil:** `app/components/wizard/StepResults.tsx` rad 29-37

Wizard-steget beräknar CO₂e client-side med hårdkodade faktorer (`materialWeight * 1.2`, `electricityKwh * 0.05`, etc.). Dessa matchar **inte** backend-faktorerna i `factors.json`.

Jämförelse för möbelmallen:
- **Wizard (client):** ~12.3 kg CO₂e (med `* 1.2` faktor)
- **Backend (lokala faktorer):** ~33.8 kg CO₂e (med factors.json)
- **Avvikelse:** ~63% lägre i wizard

**Fix:** Wizard bör kalla backend API:t vid steg 6 istället för klient-beräkning. `handleNext()` i `wizard/page.tsx` gör redan `setTimeout` — byt mot faktiskt API-anrop till `/demo/{templateId}` eller nytt endpoint.

### 3. [HÖG] Autentisering är fasad — `get_current_user()` ignorerar JWT

**Fil:** `backend/main.py` rad 109-110

```python
def get_current_user(db):
    return db.exec(select(User).where(User.email == "demo@skandiform.example")).first()
```

Alla endpoints som använder `Depends(get_current_user)` returnerar **alltid** demo-användaren, oavsett om en JWT-token skickas. Login-endpointen skapar en riktig JWT men den valideras aldrig.

**Fix (P1):** Extrahera token från `Authorization`-header, validera JWT, slå upp användare. Behåll fallback till demo-user för unauthenticated demo-flöde.

---

## Medelallvarliga issues

### 4. [MEDEL] Login accepterar bara hårdkodat lösenord

**Fil:** `backend/main.py` rad 116

```python
if not user or request.password != "Demo123!":
```

Lösenordet hashas korrekt i `seed.py` med bcrypt, men login-endpointen jämför mot den hårdkodade strängen `"Demo123!"` istället för att köra `pwd_context.verify(request.password, user.password_hash)`.

### 5. [MEDEL] `Product.organisation_id` saknas i modellen

**Fil:** `backend/models.py` rad 31-39 vs `backend/main.py` rad 376

Modellen har `org_id` men PDF-certifikatendpointen refererar till `product.organisation_id` (rad 376) — detta kraschar med `AttributeError`.

### 6. [MEDEL] Spend-flöde saknar backend-endpoint

`CLAUDE.md` specificerar `POST /demo/spend` och `spend_calculator.py`, men dessa finns inte i koden. StepMaterials.tsx har toggle för spend-läge men spendValues skickas aldrig till backend — de stannar i lokal React state.

### 7. [MEDEL] `datetime.utcnow()` är deprecated

**Filer:** `backend/models.py` (5 förekomster), `backend/main.py` (rad 120, 385)

Python 3.12+ varnar för `datetime.utcnow()`. Byt till `datetime.now(timezone.utc)`.

### 8. [MEDEL] Saknade emissionsfaktorer ger tyst 0-resultat

**Fil:** `backend/calculator.py` rad 95-96

```python
if not factors:
    continue
```

Om `dataset_ref` inte matchar något i `factors.json`, hoppas materialet över **utan varning**. Seed-data har refs som `"steel"` som matchar, men användarinput kan ha `"Steel"`, `"stainless_steel"`, etc. som ger 0 bidrag.

**Fix:** Logga en warning, lägg till i en "unmapped materials"-lista i resultatet.

### 9. [MEDEL] Transportberäkning använder komponent-quantity som massa

**Fil:** `backend/calculator.py` rad 139

```python
component_mass_tons = component.quantity / 1000 if component.unit == "kg" else component.quantity
```

Om `component.unit` inte är `"kg"` (t.ex. `"st"`, `"l"`), divideras inte med 1000 — en komponent med quantity=2.2 och unit="kg" ger 0.0022 ton, men en med quantity=1 och unit="st" ger 1 ton. Det borde vara summan av materialvikt, inte komponentens quantity.

---

## Lågallvarliga issues

### 10. [LÅG] Demo-template "construction" och "textile" saknas i backend

`INDUSTRY_TEMPLATES` i `backend/main.py` har bara `furniture`, `food`, `workshop`. De nya mallarna `construction` och `textile` finns i frontend (`types.ts`, `demo/page.tsx`) men inte i backend — `POST /demo/construction` ger 404.

### 11. [LÅG] ROI-kalkylator visar orealistiska siffror vid låg omsättning

**Fil:** `app/app/demo/page.tsx` rad 86-88

Vid revenue=1 MSEK och tenderShare=5%:
- Risk: `1 * 0.05 * 0.15 * 1000 = 7.5 tkr`
- ROI: `7500 / 24 = 312x` — fortfarande visar 312x ROI
- Payback: `24000 / (7500 * 10) = 0 dagar` — avrundas till 0

Siffran "payback 0 dagar" ser oseriös ut.

### 12. [LÅG] Ingen felhantering i wizard vid nätverksfel

`wizard/page.tsx` rad 48-54 fångar fel men visar inget felmeddelande — `catch` gör bara `setIsCalculating(false)`.

### 13. [LÅG] CSS-klass `text-verified` refereras men definieras kanske inte

I `demo/page.tsx` rad 286: `text-verified` — om denna klass inte finns i Tailwind-konfigen blir texten ostyled.

### 14. [LÅG] `factors.json` saknar `plastic_film`, `pallet`, `coolant`, `steel_rebar`

Frontend-templates refererar material-id:n (`steel_rebar`, `coolant`, etc.) som inte har matchande emissionsfaktorer — beräkningen för dessa ger 0 bidrag.

---

## Spot-check: Beräkningsverifiering

### Kontorsstol Ergo Pro (seed data, lokala faktorer)

| Komponent | CO₂e | Andel |
|-----------|------|-------|
| Stålfot med hjul | 14.12 kg | 41.8% |
| Sits med skumstoppning | 11.67 kg | 34.5% |
| Ryggstöd | 6.62 kg | 19.6% |
| Gasdämpare | 1.38 kg | 4.1% |
| **TOTALT** | **33.79 kg** | **100%** |

Stämmer med backend-logik vid lokal beräkning (utan Climatiq). Rimligt för en kontorsstol (branschsnitt i prompten: 18.2 kg) — men notera att 33.8 kg ligger **86% över** branschsnittet. Kan bero på att seed-datan inkluderar mer detaljerade komponenter.

### Wizard client-side (furniture template)

Total: **12.3 kg CO₂e** — 32% under branschsnitt. Betydligt lägre än backend-resultatet. Anledning: hårdkodade faktorer (1.2 per kg material) vs faktiska data i factors.json (2.3 för stål, 4.2 för skum, etc.).

---

## Arkitektur-observationer

**Bra:**
- Ren separation frontend/backend
- Fallback-kedjor (Climatiq → lokala faktorer, OpenAI → mock-parser)
- SQLModel ger smidig migration SQLite → PostgreSQL
- Designsystemet är konsekvent implementerat i alla komponenter
- Wizard-flödet följer Doconomy-mönstret väl

**Att tänka på:**
- Ingen rate limiting på API:t
- Ingen input-validering (negativa vikter accepteras)
- Export-directory skapas i backend-root — bör vara konfigurerbar
- `demo.db` committas — bör ligga i `.gitignore`
- WeasyPrint-fallback (HTML) nämns i prompten men implementeras inte

---

## Rekommenderade åtgärder (prioritetsordning)

1. **Fixa wizard → backend-anrop** (issue #2) — annars ser demo-resultaten helt annorlunda ut om man kör via wizard vs via demo-sidan
2. **Fixa CO₂e-dubbelräkning** (issue #1) — påverkar hotspot-procentandelar
3. **Lägg till construction + textile i backend** (issue #10) — krävs för demo
4. **Fixa PDF-endpoint `organisation_id`** (issue #5) — kraschar vid anrop
5. **Lägg till saknade material i factors.json** (issue #14) — för completeness
6. **Implementera spend-endpoint** (issue #6) — eller dölj toggling i wizard tills det funkar

---

*Genererad av Claude Cowork — mars 2026*
