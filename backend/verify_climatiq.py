import sys
import os
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent))

from climatiq_service import calculate_pcf

def test_climatiq_integration():
    print("Testing Climatiq Integration...")
    
    # Mock components
    components = [
        {
            "name": "Test Component",
            "quantity": 1,
            "unit": "kg",
            "materials": [
                {"dataset_ref": "steel sheet", "mass_kg": 10.0}
            ],
            "transports": []
        }
    ]
    
    # Check if API key is present
    api_key = os.getenv("CLIMATIQ_API_KEY")
    if not api_key:
        print("No API key found. Expecting fallback/empty response.")
    else:
        print("API key found. Expecting live response.")
        
    result = calculate_pcf("Test Product", components)
    
    print(f"Result: {result}")
    
    if not api_key and not result:
        print("SUCCESS: Correctly handled missing API key.")
    elif api_key and "co2e_kg" in result:
        print(f"SUCCESS: Got CO2e: {result['co2e_kg']} kg")
    else:
        print("WARNING: Unexpected result state.")

if __name__ == "__main__":
    test_climatiq_integration()
