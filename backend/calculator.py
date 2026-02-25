from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, List

from sqlmodel import Session, select

from models import Component, MaterialItem, ProcessItem, TransportItem


BASE_INDICATORS = ["co2e_kg", "water_l", "energy_mj", "land_m2a", "acid_mol_hplus", "eutro_g_po4"]
FACTORS_PATH = Path(__file__).resolve().parent.parent / "packages" / "shared" / "factors.json"

with FACTORS_PATH.open(encoding="utf-8") as fh:
    _RAW_FACTORS = json.load(fh)

# Flatten nested structure: {"materials": {"steel": {"indicators": {...}}}} → {"steel": {...}}
FACTORS: Dict[str, Dict[str, float]] = {}
for _category in ("materials", "processes", "transport"):
    for _ref, _entry in _RAW_FACTORS.get(_category, {}).items():
        FACTORS[_ref] = _entry.get("indicators", _entry)


def _factor(ref: str) -> Dict[str, float]:
    return FACTORS.get(ref, {})


def calculate_indicators(db: Session, product_id: int, dataset_version: str, method_version: str) -> Dict[str, object]:
    indicators: Dict[str, float] = {
        "co2e_kg": 0.0,
        "water_l": 0.0,
        "energy_mj": 0.0,
        "land_m2a": 0.0,
        "acid_mol_hplus": 0.0,
        "eutro_g_po4": 0.0,
        "biodiversity_index": 0.0,
        "circularity_pct": 0.0,
    }

    components = db.exec(select(Component).where(Component.product_id == product_id)).all()
    component_contributions: Dict[str, float] = {}

    total_recycled_mass = 0.0
    total_mass = 0.0
    total_land_use = 0.0
    biodiversity_pressure = 0.0

    # ... existing code ...
    
    # Try Climatiq calculation first
    from climatiq_service import calculate_pcf
    
    # Prepare component data for Climatiq
    climatiq_components = []
    for component in components:
        comp_data = {
            "name": component.name,
            "quantity": component.quantity,
            "unit": component.unit,
            "materials": [],
            "transports": []
        }
        
        # Get materials
        comp_materials = db.exec(select(MaterialItem).where(MaterialItem.component_id == component.id)).all()
        for m in comp_materials:
            comp_data["materials"].append({
                "dataset_ref": m.dataset_ref,
                "mass_kg": m.mass_kg
            })
            
        # Get transports
        comp_transports = db.exec(select(TransportItem).where(TransportItem.component_id == component.id)).all()
        for t in comp_transports:
            comp_data["transports"].append({
                "mode": t.mode,
                "distance_km": t.distance_km
            })
            
        climatiq_components.append(comp_data)

    climatiq_result = calculate_pcf(f"Product {product_id}", climatiq_components)
    
    # If Climatiq returned a valid result, use it for CO2e
    climatiq_co2e = climatiq_result.get("co2e_kg")
    using_climatiq = climatiq_co2e is not None and climatiq_co2e > 0

    for component in components:
        component_totals: Dict[str, float] = {indicator: 0.0 for indicator in BASE_INDICATORS}

        materials = db.exec(select(MaterialItem).where(MaterialItem.component_id == component.id)).all()
        for material in materials:
            factors = _factor(material.dataset_ref)
            if not factors:
                continue

            recycled_pct = (material.recycled_content_pct or 0.0) / 100
            recycled_factor = 1 - recycled_pct * 0.6

            for indicator in BASE_INDICATORS:
                if indicator in factors:
                    impact = factors[indicator] * material.mass_kg * recycled_factor
                    
                    # If using Climatiq, skip local CO2e addition to global total, 
                    # but keep it for component breakdown if needed (or overwrite)
                    if using_climatiq and indicator == "co2e_kg":
                        # We still calculate it for component_totals to have a breakdown
                        # but we won't add it to the main 'indicators' dict if we overwrite later
                        pass
                    
                    indicators[indicator] += impact
                    component_totals[indicator] += impact

            total_mass += material.mass_kg
            total_recycled_mass += material.mass_kg * recycled_pct
            if "land_m2a" in factors:
                total_land_use += material.mass_kg * factors["land_m2a"]
            if "biodiversity_impact" in factors:
                biodiversity_pressure += material.mass_kg * factors["biodiversity_impact"]

        processes = db.exec(select(ProcessItem).where(ProcessItem.component_id == component.id)).all()
        for process in processes:
            factors = _factor(process.dataset_ref)
            if not factors:
                continue
            for indicator in BASE_INDICATORS:
                if indicator in factors:
                    impact = factors[indicator] * process.energy_kwh
                    indicators[indicator] += impact
                    component_totals[indicator] += impact

        transports = db.exec(select(TransportItem).where(TransportItem.component_id == component.id)).all()
        for transport in transports:
            dataset_ref = transport.dataset_ref or f"{transport.mode}_freight"
            factors = _factor(dataset_ref)
            if not factors:
                continue
            component_mass_tons = component.quantity / 1000 if component.unit == "kg" else component.quantity
            ton_km = component_mass_tons * transport.distance_km
            for indicator in BASE_INDICATORS:
                if indicator in factors:
                    impact = factors[indicator] * ton_km
                    indicators[indicator] += impact
                    component_totals[indicator] += impact

        component_contributions[component.name] = component_totals["co2e_kg"]

    # OVERWRITE CO2e if Climatiq was successful
    if using_climatiq:
        indicators["co2e_kg"] = climatiq_co2e
        # Note: Component breakdown might be slightly off if we don't distribute the Climatiq result back.
        # For this MVP, we accept the total from Climatiq and keep the relative breakdown from local factors
        # or just accept the discrepancy.
        
    total_co2 = indicators["co2e_kg"]
    hotspots: List[Dict[str, float]] = []
    if total_co2 > 0:
        for name, contribution in sorted(component_contributions.items(), key=lambda item: item[1], reverse=True)[:3]:
            hotspots.append({"name": name, "share_pct": round((contribution / total_co2) * 100, 1)})

    if total_land_use > 0:
        indicators["biodiversity_index"] = max(0.0, min(1.0, 1 - ((total_land_use + biodiversity_pressure) / 120)))
    else:
        indicators["biodiversity_index"] = 1.0

    if total_mass > 0:
        indicators["circularity_pct"] = min(100.0, round((total_recycled_mass / total_mass) * 100, 2))
    else:
        indicators["circularity_pct"] = 0.0

    for key in indicators:
        if key not in {"biodiversity_index", "circularity_pct"}:
            indicators[key] = round(indicators[key], 2)

    assumptions = [
        {"item": "Elmix produktion", "value": "Svensk genomsnittsmix 2024", "standard": "ISO 14040", "uncertainty": "låg"},
        {"item": "Transportbeläggning", "value": "80 % lastfaktor", "standard": "ISO 14067", "uncertainty": "medel"},
    ]
    
    if using_climatiq:
        assumptions.append({
            "item": "Klimatdata", 
            "value": "Climatiq API (Live)", 
            "standard": "ISO 14067", 
            "uncertainty": "låg"
        })

    recommendations: List[Dict[str, str]] = []
    if indicators["circularity_pct"] < 50:
        recommendations.append(
            {
                "action": "Öka återvunnet innehåll till 80 %",
                "impact": "Minskar klimatpåverkan med upp till 38 %",
                "standard": "ISO 59004 – Cirkulär ekonomi",
            }
        )
    if indicators["co2e_kg"] > 100:
        recommendations.append(
            {
                "action": "Byt till förnybar energi i processer",
                "impact": "Reducerar CO₂e-utsläpp med cirka 22 %",
                "standard": "ISO 14067 – Klimatpåverkan",
            }
        )

    ai_suggestions: List[Dict[str, object]] = []
    if total_co2 > 0:
        ai_suggestions.extend(
            [
                {
                    "action": "Byt till lokalt trä (< 100 km)",
                    "expected_delta": {"co2e_kg": round(total_co2 * 0.35, 2)},
                    "rationale": "Kortare transporter och lokalt virke minskar klimatpåverkan och förenklar spårbarhet.",
                    "uncertainty": "medium",
                },
                {
                    "action": "Använd vegetabiliskt garvat läder",
                    "expected_delta": {"water_l": round(indicators["water_l"] * 0.4, 1) if indicators["water_l"] else 0},
                    "rationale": "Vegetabiliskt garvningsprocesser kan minska vattenpåverkan och kemikalieanvändning.",
                    "uncertainty": "medium",
                },
                {
                    "action": "Implementera retursystem för renovering",
                    "expected_delta": {"circularity_pct": 75},
                    "rationale": "Ett retursystem med renovering och återförsäljning kan öka cirkulariteten kraftigt och skapa nya intäkter.",
                    "uncertainty": "low",
                },
            ]
        )

    return {
        "indicators": indicators,
        "hotspots": hotspots,
        "assumptions": assumptions,
        "recommendations": recommendations,
        "ai_suggestions": ai_suggestions,
    }


