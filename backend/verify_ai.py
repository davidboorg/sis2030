import sys
import os
import asyncio
from pathlib import Path
from dotenv import load_dotenv

# Load env
load_dotenv(Path(__file__).parent / ".env.local")

# Add backend to path
sys.path.append(str(Path(__file__).parent))

from ai_service import parse_bom_description, match_material

async def test_ai_service():
    print("Testing AI Service...")
    
    # Check API Key
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("ERROR: OPENAI_API_KEY not found.")
        return

    print(f"API Key found: {api_key[:5]}...")

    # Test 1: Material Matching
    print("\nTest 1: Material Matching ('rostfritt stål')")
    try:
        matches = await match_material("rostfritt stål")
        print(f"Matches: {matches}")
        if matches and matches[0]["dataset_ref"] == "mat_steel":
             print("SUCCESS: Matched steel.")
        else:
             print("WARNING: Unexpected match result.")
    except Exception as e:
        print(f"ERROR in Material Matching: {e}")

    # Test 2: BOM Parsing
    print("\nTest 2: BOM Parsing")
    description = "En stol med 5kg stålram och 2kg eksits."
    try:
        components = await parse_bom_description(description)
        print(f"Components: {components}")
        if len(components) >= 2:
            print("SUCCESS: Parsed components.")
        else:
            print("WARNING: Parsed fewer components than expected.")
    except Exception as e:
        print(f"ERROR in BOM Parsing: {e}")

if __name__ == "__main__":
    asyncio.run(test_ai_service())
