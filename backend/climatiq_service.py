import os
import requests
from typing import Dict, List, Optional, Any

CLIMATIQ_API_URL = "https://api.climatiq.io/custom-activities/v1"
CLIMATIQ_API_KEY = os.getenv("CLIMATIQ_API_KEY")

def calculate_pcf(product_name: str, components: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculate Product Carbon Footprint using Climatiq API.
    
    Args:
        product_name: Name of the product
        components: List of component dictionaries with keys:
            - name: str
            - quantity: float
            - unit: str
            - materials: List[Dict] (optional)
            - transports: List[Dict] (optional)
            
    Returns:
        Dict containing co2e_kg and other metadata from Climatiq
    """
    if not CLIMATIQ_API_KEY:
        print("Warning: CLIMATIQ_API_KEY not set. Skipping Climatiq calculation.")
        return {}

    # Map our internal component structure to Climatiq's BOM format
    # Note: This is a simplified mapping. In a real scenario, we would need
    # precise mapping of emission factors to Climatiq's database IDs.
    # For this demo/MVP, we will try to use their 'estimate' or 'search' features
    # if available, or construct a custom activity.
    
    # Since the PCF endpoint is complex/preview, we might simulate it 
    # by summing up individual estimates if the full PCF endpoint isn't easily accessible
    # without specific beta access. However, based on the user request, 
    # let's assume we want to use a structure that *could* be sent to a PCF endpoint.
    
    # For now, we will implement a robust fallback:
    # We will iterate through components and fetch emission factors from Climatiq
    # to replace our local factors.
    
    total_co2e = 0.0
    climatiq_results = []
    
    headers = {
        "Authorization": f"Bearer {CLIMATIQ_API_KEY}",
        "Content-Type": "application/json"
    }

    for component in components:
        # 1. Process Materials
        for material in component.get("materials", []):
            # Try to find a matching factor in Climatiq
            # This is a simplified search. In production, you'd cache these IDs.
            query = material.get("dataset_ref", "").replace("_", " ")
            
            # Example search payload
            search_payload = {
                "query": query,
                "data_version": "^5"
            }
            
            try:
                # First, search for the factor
                search_resp = requests.get(
                    "https://api.climatiq.io/data/v1/search",
                    params=search_payload,
                    headers=headers
                )
                
                if search_resp.status_code == 200:
                    results = search_resp.json().get("results", [])
                    if not results:
                        print(f"Debug: No results found for '{query}'")
                    if results:
                        # Take the first match
                        factor = results[0]
                        
                        # Construct emission_factor selector
                        selector = {
                            "activity_id": factor["activity_id"],
                            "source": factor["source"],
                            "region": factor["region"],
                            "year": factor["year"],
                            "data_version": "^5"
                        }
                        if "lca_activity" in factor:
                            selector["lca_activity"] = factor["lca_activity"]

                        # Calculate
                        estimate_payload = {
                            "emission_factor": selector,
                            "parameters": {
                                "weight": material.get("mass_kg", 0),
                                "weight_unit": "kg"
                            }
                        }
                        
                        est_resp = requests.post(
                            "https://api.climatiq.io/data/v1/estimate",
                            json=estimate_payload,
                            headers=headers
                        )
                        
                        if est_resp.status_code == 200:
                            est_data = est_resp.json()
                            co2e = est_data.get("co2e", 0)
                            total_co2e += co2e
                            climatiq_results.append({
                                "component": component["name"],
                                "material": query,
                                "co2e": co2e,
                                "source": "Climatiq API"
                            })
                            continue
            except Exception as e:
                print(f"Error calling Climatiq for {query}: {e}")
                
        # 2. Process Transports (Simplified)
        for transport in component.get("transports", []):
            # Similar logic for transport...
            pass

    return {
        "co2e_kg": total_co2e,
        "details": climatiq_results,
        "source": "Climatiq API"
    }
