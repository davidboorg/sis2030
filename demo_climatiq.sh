#!/bin/bash

# Base URL
API_URL="http://localhost:8002"

echo "1. Logging in..."
TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@skandiform.example", "password": "Demo123!"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Token obtained."

echo -e "\n2. Creating Product 'Climatiq Demo Chair'..."
PRODUCT_ID=$(curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Climatiq Demo Chair", "unit": "pcs"}' | grep -o '"product_id":[0-9]*' | cut -d':' -f2)

echo "Product ID: $PRODUCT_ID"

echo -e "\n3. Adding Component 'Steel Frame'..."
COMP_ID=$(curl -s -X POST "$API_URL/products/$PRODUCT_ID/components" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Steel Frame", "quantity": 5, "unit": "kg"}' | grep -o '"component_id":[0-9]*' | cut -d':' -f2)

echo "Component ID: $COMP_ID"

echo -e "\n4. Adding Material 'steel sheet' (10kg)..."
curl -s -X POST "$API_URL/components/$COMP_ID/materials" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"dataset_ref": "steel sheet", "mass_kg": 10}' > /dev/null

echo "Material added."

echo -e "\n5. Running Calculation..."
RUN_ID=$(curl -s -X POST "$API_URL/runs" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"product_id\": $PRODUCT_ID}" | grep -o '"run_id":[0-9]*' | cut -d':' -f2)

echo "Run ID: $RUN_ID"

echo -e "\n6. Fetching Results..."
RESULT=$(curl -s -X GET "$API_URL/runs/$RUN_ID" \
  -H "Authorization: Bearer $TOKEN")

echo -e "\n--- CLIMATIQ INTEGRATION RESULT ---"
echo "$RESULT" | grep -o '"co2e_kg":[0-9.]*'
echo "$RESULT" | grep -o '"assumptions":\[[^]]*\]'
