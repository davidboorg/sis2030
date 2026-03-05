# Buggfix-prompt — klistra in i Claude Code

Fixa dessa 6 kritiska buggar i TR/ACE. Gör dem i ordning. Testa varje fix innan du går vidare.

---

## 1. Wizard ska kalla backend API istället för client-side beräkning

**Problem:** `app/components/wizard/StepResults.tsx` beräknar CO₂e client-side med hårdkodade faktorer (`materialWeight * 1.2`). Det ger ~12 kg för en kontorsstol. Backend ger ~34 kg med riktiga faktorer. 63% avvikelse.

**Fix:**
- I `app/app/demo/wizard/page.tsx`, ändra `handleNext()` så att den vid steg 4→5 kallar `POST /demo/{templateId}` med wizard-datan istället för `setTimeout`.
- Skapa nytt endpoint `POST /demo/wizard` i `backend/main.py` som tar emot wizard-data (materials[], electricityKwh, heatKwh, transportDistances) och returnerar beräknade indikatorer, hotspots, scope-breakdown.
- Uppdatera `StepResults.tsx` att ta emot backend-resultat via props istället för att beräkna själv. Behåll scope-donut och benchmark-visualisering men mata dem med riktiga siffror.
- Behåll client-side beräkningen som fallback om API-anropet misslyckas.

## 2. Fixa CO₂e-dubbelräkning vid Climatiq

**Problem:** `backend/calculator.py` rad 107-113. `pass`-satsen hindrar INTE att `indicators[indicator] += impact` körs på rad 112 för CO₂e. Hotspot-procentandelarna blir fel.

**Fix:**
- Lägg till `continue` efter `pass` ELLER wrappa rad 112 med `if not (using_climatiq and indicator == "co2e_kg"):`
- Alternativt: Distribuera Climatiq-totalen proportionellt mot komponenterna i `component_contributions` efter beräkning.

## 3. Lägg till construction och textile i backend INDUSTRY_TEMPLATES

**Problem:** Frontend har 5 branscher, backend har bara 3. `POST /demo/construction` ger 404.

**Fix i `backend/main.py`:**
```python
INDUSTRY_TEMPLATES = {
    # ... befintliga ...
    "construction": {
        "name": "Bygg & Fastighet",
        "product_name": "Byggelement",
        "components": [
            {"name": "Betongstomme", "quantity": 15, "unit": "kg",
             "materials": [{"dataset_ref": "concrete", "mass_kg": 15}],
             "processes": [{"dataset_ref": "process_concrete_mixing", "energy_kwh": 5}],
             "transports": [{"mode": "road", "distance_km": 100, "origin_iso": "SE", "dest_iso": "SE"}]},
            {"name": "Armeringsstål", "quantity": 8, "unit": "kg",
             "materials": [{"dataset_ref": "steel", "mass_kg": 8}],
             "processes": [{"dataset_ref": "process_metal_forming", "energy_kwh": 6}],
             "transports": []},
            {"name": "Isolering", "quantity": 3, "unit": "kg",
             "materials": [{"dataset_ref": "insulation", "mass_kg": 3}],
             "processes": [],
             "transports": []}
        ]
    },
    "textile": {
        "name": "Textil",
        "product_name": "Plagg (t-shirt)",
        "components": [
            {"name": "Bomullstyg", "quantity": 0.3, "unit": "kg",
             "materials": [{"dataset_ref": "cotton", "mass_kg": 0.3}],
             "processes": [{"dataset_ref": "process_weaving", "energy_kwh": 1}],
             "transports": [{"mode": "sea", "distance_km": 8000, "origin_iso": "IN", "dest_iso": "SE"}]},
            {"name": "Polyesterdetaljer", "quantity": 0.15, "unit": "kg",
             "materials": [{"dataset_ref": "polyester", "mass_kg": 0.15}],
             "processes": [],
             "transports": []},
            {"name": "Färgning", "quantity": 2, "unit": "kWh",
             "materials": [{"dataset_ref": "dye", "mass_kg": 0.01}],
             "processes": [{"dataset_ref": "process_dyeing", "energy_kwh": 2}],
             "transports": []}
        ]
    }
}
```

Lägg även till INDUSTRY_BENCHMARKS om det inte redan finns:
```python
INDUSTRY_BENCHMARKS = {
    "furniture": {"avg_co2e": 18.2, "best_co2e": 8.1, "unit": "kg CO₂e/stol"},
    "food": {"avg_co2e": 3.5, "best_co2e": 1.2, "unit": "kg CO₂e/kg produkt"},
    "workshop": {"avg_co2e": 45.0, "best_co2e": 22.0, "unit": "kg CO₂e/detalj"},
    "construction": {"avg_co2e": 120.0, "best_co2e": 65.0, "unit": "kg CO₂e/element"},
    "textile": {"avg_co2e": 8.5, "best_co2e": 3.2, "unit": "kg CO₂e/plagg"},
}
```

## 4. Fixa PDF-endpoint crash (`organisation_id` → `org_id`)

**Problem:** `backend/main.py` rad 376 refererar `product.organisation_id` men modellen har `product.org_id`.

**Fix:** Ändra `product.organisation_id` till `product.org_id` i `get_certificate_pdf()`.

## 5. Fixa login att använda bcrypt-hash

**Problem:** `backend/main.py` rad 116 jämför lösenord som klartext istället för att verifiera mot hash.

**Fix:**
```python
if not user or not pwd_context.verify(request.password, user.password_hash):
    raise HTTPException(status_code=401, detail="Invalid credentials")
```

## 6. Lägg till saknade material-faktorer i factors.json

**Problem:** `plastic_film`, `pallet`, `coolant`, `steel_rebar`, `steel_raw` saknas i `packages/shared/factors.json`. Beräkning för dessa ger tyst 0.

**Fix:** Lägg till i `factors.json` under `materials`:
```json
"plastic_film": {
  "name": "Plastfilm (PE)",
  "unit": "kg",
  "indicators": {"co2e_kg": 2.8, "water_l": 18.0, "energy_mj": 65.0, "land_m2a": 0.003, "acid_mol_hplus": 0.009, "eutro_g_po4": 0.002, "biodiversity_impact": 0.1, "recyclability": 0.40}
},
"pallet": {
  "name": "Pall (trä)",
  "unit": "kg",
  "indicators": {"co2e_kg": 0.3, "water_l": 10.0, "energy_mj": 5.0, "land_m2a": 0.003, "acid_mol_hplus": 0.001, "eutro_g_po4": 0.0004, "biodiversity_impact": 0.05, "recyclability": 0.85}
},
"coolant": {
  "name": "Kylvätska",
  "unit": "kg",
  "indicators": {"co2e_kg": 1.5, "water_l": 5.0, "energy_mj": 20.0, "land_m2a": 0.001, "acid_mol_hplus": 0.005, "eutro_g_po4": 0.003, "biodiversity_impact": 0.08, "recyclability": 0.20}
},
"steel_rebar": {
  "name": "Armeringsstål",
  "unit": "kg",
  "indicators": {"co2e_kg": 1.9, "water_l": 40.0, "energy_mj": 30.0, "land_m2a": 0.007, "acid_mol_hplus": 0.013, "eutro_g_po4": 0.003, "biodiversity_impact": 0.18, "recyclability": 0.95}
},
"steel_raw": {
  "name": "Stål (rå)",
  "unit": "kg",
  "indicators": {"co2e_kg": 2.3, "water_l": 45.0, "energy_mj": 35.0, "land_m2a": 0.008, "acid_mol_hplus": 0.015, "eutro_g_po4": 0.003, "biodiversity_impact": 0.2, "recyclability": 0.90}
}
```

---

## Verifiering

Efter alla fixar, kör:
1. `python backend/seed.py` — bör lyckas utan fel
2. `uvicorn main:app --reload --port 8001` — bör starta
3. `POST /demo/construction` — bör returnera indikatorer
4. `POST /demo/textile` — bör returnera indikatorer
5. `GET /certificate/1/pdf` — bör inte krascha
6. Kolla att wizard-sidan kallar backend och visar rimliga siffror

Commita med meddelande: `fix: resolve 6 critical bugs from validation report`
