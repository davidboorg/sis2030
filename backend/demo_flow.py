import requests
import json
import os
import sys
import asyncio
from pathlib import Path

# Add backend to path for AI service import
sys.path.append(str(Path(__file__).parent))
from ai_service import parse_bom_description

BASE_URL = "http://localhost:8002"

def run_demo():
    print("\n🚀 STARTING FULL SYSTEM DEMO 🚀")
    print("=================================")

    # 1. Login
    print("\n1. Logging in...")
    try:
        resp = requests.post(f"{BASE_URL}/auth/login", json={"email": "demo@skandiform.example", "password": "Demo123!"})
        if resp.status_code != 200:
            print(f"❌ Login failed: {resp.text}")
            return
        token = resp.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("✅ Login successful!")
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return

    # 2. Create Product
    print("\n2. Creating Product 'Climatiq Demo Chair'...")
    resp = requests.post(f"{BASE_URL}/products", json={"name": "Climatiq Demo Chair", "unit": "pcs"}, headers=headers)
    if resp.status_code != 200:
        print(f"❌ Product creation failed: {resp.text}")
        return
    product_id = resp.json()["product_id"]
    print(f"✅ Product created (ID: {product_id})")

    # 3. Add Component
    print("\n3. Adding Component 'Steel Frame'...")
    resp = requests.post(f"{BASE_URL}/products/{product_id}/components", json={"name": "Steel Frame", "quantity": 5, "unit": "kg"}, headers=headers)
    comp_id = resp.json()["component_id"]
    print(f"✅ Component added (ID: {comp_id})")

    # 4. Add Material (Climatiq Trigger)
    print("\n4. Adding Material 'steel sheet' (10kg)...")
    resp = requests.post(f"{BASE_URL}/components/{comp_id}/materials", json={"dataset_ref": "steel sheet", "mass_kg": 10}, headers=headers)
    print("✅ Material added")

    # 5. Run Calculation
    print("\n5. Running Calculation (Triggering Climatiq API)...")
    resp = requests.post(f"{BASE_URL}/runs", json={"product_id": product_id}, headers=headers)
    if resp.status_code != 200:
        print(f"❌ Calculation failed: {resp.text}")
        return
    run_data = resp.json()
    
    print("\n📊 CALCULATION RESULTS")
    print("----------------------")
    print(f"CO2e (Total): {run_data['indicators'].get('co2e_kg')} kg")
    
    # Check for Climatiq source
    is_climatiq = False
    for assumption in run_data.get("assumptions", []):
        if "Climatiq" in assumption.get("value", ""):
            is_climatiq = True
            print(f"✅ Source Verified: {assumption['value']}")
    
    if not is_climatiq:
        print("⚠️ Warning: Climatiq source not found in assumptions.")

    # 6. AI Service Test
    print("\n🤖 TESTING AI SERVICE")
    print("---------------------")
    description = "En stol med 5kg stålram och 2kg eksits."
    print(f"Input: '{description}'")
    
    try:
        # Call API instead of local function
        ai_resp = requests.post(f"{BASE_URL}/ai/parse-bom", json={"text": description}, headers=headers)
        if ai_resp.status_code == 200:
            components = ai_resp.json()["components"]
            print(f"AI Output: {json.dumps(components, indent=2, ensure_ascii=False)}")
            
            # Check if it's mock data (Motorsats) or real
            if components and components[0].get("name") == "Motorsats":
                 print("⚠️ Warning: AI returned mock data (Motorsats).")
            elif len(components) > 0:
                print("✅ AI Parsing Successful (Real Data)!")
            else:
                print("⚠️ AI Parsing returned empty list.")
        else:
            print(f"❌ AI API Error: {ai_resp.text}")
    except Exception as e:
        print(f"❌ AI Error: {e}")

    print("\n✨ DEMO COMPLETE ✨")

if __name__ == "__main__":
    run_demo()
