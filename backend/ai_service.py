"""
AI Service for 2030+ Calculator
Handles OpenAI/Claude API calls for BOM parsing, material matching, and insights
"""

import os
import json
from typing import List, Dict, Any, Optional

# Try to import OpenAI, fallback to mock if not available
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4-turbo-preview")
AI_TEMPERATURE = float(os.getenv("AI_TEMPERATURE", "0.3"))
AI_MAX_TOKENS = int(os.getenv("AI_MAX_TOKENS", "2000"))


def get_openai_client():
    """Get OpenAI client if API key is available"""
    if OPENAI_AVAILABLE and OPENAI_API_KEY:
        openai.api_key = OPENAI_API_KEY
        return openai
    return None


async def parse_bom_description(text: str) -> List[Dict[str, Any]]:
    """
    Parse natural language BOM description into structured components
    """
    client = get_openai_client()
    
    if not client:
        # Fallback: Simple rule-based parsing for demo
        return _mock_parse_bom(text)
    
    try:
        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[{
                "role": "system",
                "content": """Du är en LCA-expert. Extrahera komponenter från textbeskrivning.
Returnera JSON med format:
{
  "components": [
    {
      "name": "komponentnamn",
      "quantity": 12.0,
      "unit": "kg",
      "material_type": "aluminium",
      "recycled_content_pct": 30,
      "suggested_dataset": "mat_al_primary"
    }
  ]
}"""
            }, {
                "role": "user",
                "content": f"Extrahera komponenter från: {text}"
            }],
            temperature=AI_TEMPERATURE,
            max_tokens=AI_MAX_TOKENS,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        return result.get("components", [])
    except Exception as e:
        print(f"AI parsing error: {e}")
        return _mock_parse_bom(text)


def _mock_parse_bom(text: str) -> List[Dict[str, Any]]:
    """Mock BOM parser for demo when AI is not available"""
    text_lower = text.lower()
    components = []
    
    if "aluminium" in text_lower or "aluminum" in text_lower:
        components.append({
            "name": "Aluminiumhölje",
            "quantity": 12.0,
            "unit": "kg",
            "material_type": "aluminium",
            "recycled_content_pct": 30 if "återvunnet" in text_lower or "recycled" in text_lower else 0,
            "suggested_dataset": "mat_al_primary"
        })
    
    if "stål" in text_lower or "steel" in text_lower or "motor" in text_lower:
        components.append({
            "name": "Motorsats",
            "quantity": 25.0,
            "unit": "kg",
            "material_type": "stål",
            "recycled_content_pct": 0,
            "suggested_dataset": "mat_steel"
        })
    
    if "kretskort" in text_lower or "pcb" in text_lower or "kort" in text_lower:
        components.append({
            "name": "Styrkort (PCB)",
            "quantity": 0.8,
            "unit": "kg",
            "material_type": "pcb",
            "recycled_content_pct": 0,
            "suggested_dataset": "mat_pcb"
        })
    
    return components


async def match_material(query: str, context: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Match material name to dataset reference with confidence scores
    """
    client = get_openai_client()
    
    # Known material mappings
    material_map = {
        "aluminium": {"ref": "mat_al_primary", "name": "Aluminium (primär)", "confidence": 0.95},
        "återvunnet aluminium": {"ref": "mat_al_secondary", "name": "Aluminium (återvunnet)", "confidence": 0.90},
        "recycled aluminum": {"ref": "mat_al_secondary", "name": "Aluminium (återvunnet)", "confidence": 0.90},
        "stål": {"ref": "mat_steel", "name": "Stål", "confidence": 0.95},
        "steel": {"ref": "mat_steel", "name": "Stål", "confidence": 0.95},
        "pcb": {"ref": "mat_pcb", "name": "Kretskort (PCB)", "confidence": 0.90},
        "kretskort": {"ref": "mat_pcb", "name": "Kretskort (PCB)", "confidence": 0.90},
    }
    
    query_lower = query.lower()
    
    # Direct match
    for key, value in material_map.items():
        if key in query_lower:
            return [{
                "dataset_ref": value["ref"],
                "name": value["name"],
                "confidence": value["confidence"],
                "suggested_recycled_content": 0 if "primary" in value["ref"] or "steel" in value["ref"] else 50,
                "typical_density_kg_m3": 2700 if "al" in value["ref"] else 7850 if "steel" in value["ref"] else 2000
            }]
    
    # AI matching if available
    if client:
        try:
            response = client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[{
                    "role": "system",
                    "content": "Du är en LCA-expert. Matcha materialnamn mot vanliga dataset-referenser. Returnera JSON med top 3 matchningar."
                }, {
                    "role": "user",
                    "content": f"Matcha material: {query}"
                }],
                temperature=AI_TEMPERATURE,
                max_tokens=500,
                response_format={"type": "json_object"}
            )
            # Parse AI response
            result = json.loads(response.choices[0].message.content)
            return result.get("matches", [])
        except Exception as e:
            print(f"AI matching error: {e}")
    
    # Fallback
    return [{
        "dataset_ref": "mat_steel",
        "name": "Stål (generisk)",
        "confidence": 0.5,
        "suggested_recycled_content": 0,
        "typical_density_kg_m3": 7850
    }]


async def generate_improvement_suggestions(
    indicators: Dict[str, float],
    hotspots: List[Dict[str, Any]],
    components: Optional[List[Dict[str, Any]]] = None
) -> List[Dict[str, Any]]:
    """
    Generate AI-powered improvement suggestions based on LCA results
    """
    client = get_openai_client()
    
    context = f"""
Produkt har följande miljöpåverkan:
- CO₂e: {indicators.get('co2e_kg', 0)} kg
- Energi: {indicators.get('energy_mj', 0)} MJ
- Vatten: {indicators.get('water_l', 0)} L

Största bidragare (hotspots):
{json.dumps(hotspots, indent=2)}

Föreslå 3-5 konkreta, realistiska förbättringar med förväntad procentuell minskning.
Fokusera på åtgärder som är praktiskt genomförbara.
"""
    
    if client:
        try:
            response = client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[{
                    "role": "system",
                    "content": "Du är en LCA-expert som ger konkreta förbättringsförslag. Returnera JSON med rankade förslag."
                }, {
                    "role": "user",
                    "content": context
                }],
                temperature=AI_TEMPERATURE,
                max_tokens=AI_MAX_TOKENS,
                response_format={"type": "json_object"}
            )
            result = json.loads(response.choices[0].message.content)
            return result.get("suggestions", [])
        except Exception as e:
            print(f"AI suggestions error: {e}")
    
    # Fallback suggestions
    suggestions = []
    
    # Check if aluminium is a hotspot
    for hotspot in hotspots:
        if "aluminium" in hotspot.get("name", "").lower():
            suggestions.append({
                "action": "Byt till 80% återvunnet aluminium",
                "expected_delta": {"co2e_kg": -0.38},
                "rationale": "Återvunnet Al har 60-80% lägre CO₂e-utsläpp än primäraluminium",
                "uncertainty": "medium",
                "priority": 1,
                "estimated_reduction_pct": 38
            })
    
    # Check transport
    if any("transport" in str(hotspot).lower() for hotspot in hotspots):
        suggestions.append({
            "action": "Optimera transport: Använd sjötransport istället för flyg",
            "expected_delta": {"co2e_kg": -0.22},
            "rationale": "Sjötransport har 80-90% lägre CO₂e per ton-km än flyg",
            "uncertainty": "low",
            "priority": 2,
            "estimated_reduction_pct": 22
        })
    
    # Energy optimization
    if indicators.get("energy_mj", 0) > 1000:
        suggestions.append({
            "action": "Byt till förnybar energi i produktion",
            "expected_delta": {"co2e_kg": -0.15},
            "rationale": "Förnybar energi kan minska CO₂e med 50-80% i produktion",
            "uncertainty": "medium",
            "priority": 3,
            "estimated_reduction_pct": 15
        })
    
    return suggestions[:5]  # Return top 5


async def validate_component_data(
    component_type: str,
    mass_kg: Optional[float] = None,
    material: Optional[str] = None,
    energy_kwh: Optional[float] = None
) -> List[Dict[str, Any]]:
    """
    Validate component data and flag unrealistic values
    """
    warnings = []
    
    # Mass validation
    if mass_kg is not None:
        if component_type == "pcb" and mass_kg > 2:
            warnings.append({
                "type": "mass",
                "message": f"{mass_kg} kg för ett kretskort verkar högt. Typiskt värde: 0.1-1 kg",
                "suggestion": "Kontrollera att enheten är korrekt (kg vs g)",
                "severity": "warning"
            })
        elif component_type == "component" and mass_kg < 0.001:
            warnings.append({
                "type": "mass",
                "message": f"{mass_kg} kg verkar mycket lågt",
                "suggestion": "Kontrollera att enheten är korrekt",
                "severity": "info"
            })
    
    # Energy validation
    if energy_kwh is not None and mass_kg:
        energy_per_kg = energy_kwh / mass_kg if mass_kg > 0 else 0
        if energy_per_kg > 10:
            warnings.append({
                "type": "energy",
                "message": f"Energiförbrukning {energy_kwh} kWh för {mass_kg} kg verkar hög",
                "suggestion": "Typisk energiförbrukning för aluminiumgjutning är 3-5 kWh/kg",
                "severity": "warning"
            })
    
    return warnings


async def generate_transport_route(
    origin: str,
    destination: str,
    product_type: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generate realistic transport route with multimodal options
    """
    # Simple rule-based routing for demo
    routes = {
        ("shenzhen", "stockholm"): {
            "mode": "multimodal",
            "segments": [
                {"mode": "road", "distance_km": 50, "origin_iso": "CN", "dest_iso": "CN", "description": "Shenzhen → Hong Kong port"},
                {"mode": "sea", "distance_km": 18000, "origin_iso": "CN", "dest_iso": "SE", "description": "Sjötransport Hong Kong → Gothenburg"},
                {"mode": "road", "distance_km": 300, "origin_iso": "SE", "dest_iso": "SE", "description": "Gothenburg → Stockholm"}
            ],
            "total_distance_km": 18350,
            "estimated_days": 35
        }
    }
    
    origin_lower = origin.lower()
    dest_lower = destination.lower()
    
    for (orig, dest), route in routes.items():
        if orig in origin_lower and dest in dest_lower:
            return route
    
    # Default route
    return {
        "mode": "road",
        "segments": [{
            "mode": "road",
            "distance_km": 1000,
            "origin_iso": "SE",
            "dest_iso": "SE",
            "description": f"{origin} → {destination}"
        }],
        "total_distance_km": 1000,
        "estimated_days": 2
    }


async def chat_assistant(question: str, context: Optional[str] = None) -> Dict[str, Any]:
    """
    Chat assistant for LCA guidance
    """
    client = get_openai_client()
    
    system_prompt = """Du är en expert-assistent för LCA (Life Cycle Assessment) enligt ISO 14040/14044.
Svar på svenska med tydliga, praktiska svar. Inkludera relevanta ISO-standarder när det är relevant."""
    
    if client:
        try:
            response = client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": question}
                ],
                temperature=0.7,  # Slightly higher for conversational
                max_tokens=1000
            )
            return {
                "answer": response.choices[0].message.content,
                "sources": ["ISO 14040", "ISO 14044", "ISO 14067"]
            }
        except Exception as e:
            print(f"AI chat error: {e}")
    
    # Fallback responses
    fallback_responses = {
        "cradle-to-gate": "Cradle-to-gate omfattar från råvarutagning till fabriksport. Cradle-to-cradle inkluderar även användning och återvinning.",
        "vatten": "Vattenförbrukning beräknas som totalt vatten som används i alla processer, inklusive indirekt vatten i energi och material.",
        "recycled": "För köpt aluminium, kontrollera leverantörens certifiering. Typiskt värde för återvunnet aluminium är 30-80%."
    }
    
    question_lower = question.lower()
    for key, answer in fallback_responses.items():
        if key in question_lower:
            return {"answer": answer, "sources": ["ISO 14040"]}
    
    return {
        "answer": "För mer information om LCA-metodik, se ISO 14040 och ISO 14044. Kontakta support för specifika frågor.",
        "sources": ["ISO 14040", "ISO 14044"]
    }

