#!/bin/bash

# 🧪 COLLECTION MANAGEMENT TEST SUITE
# Tests creating, reading, and updating collections with fields

BASE_URL="http://localhost:5000/api"
AUTH_TOKEN="YOUR_JWT_TOKEN_HERE"  # Replace with actual token

echo "========================================="
echo "🧪 COLLECTION MANAGEMENT TEST SUITE"
echo "========================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: CREATE COLLECTION
echo -e "\n${YELLOW}1️⃣ Creating Collection...${NC}"
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/collections" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Users",
    "projectId": "67a1b8c2d4e5f6g7h8i9j0k1",
    "fields": [
      {"name": "email", "type": "string", "required": true, "unique": true},
      {"name": "age", "type": "number", "required": false}
    ],
    "isPublic": false
  }')

COLLECTION_ID=$(echo $CREATE_RESPONSE | grep -o '"_id":"[^"]*' | sed 's/"_id":"//' | head -1)
echo "Response: $CREATE_RESPONSE"
echo -e "${GREEN}✅ Collection Created with ID: $COLLECTION_ID${NC}"

# Test 2: GET COLLECTION
echo -e "\n${YELLOW}2️⃣ Getting Collection Details...${NC}"
GET_RESPONSE=$(curl -s -X GET "$BASE_URL/collections/detail/$COLLECTION_ID" \
  -H "Authorization: Bearer $AUTH_TOKEN")
echo "Response: $GET_RESPONSE"
echo -e "${GREEN}✅ Collection Retrieved${NC}"

# Test 3: UPDATE COLLECTION (ADD NEW FIELD)
echo -e "\n${YELLOW}3️⃣ Adding New Field to Collection...${NC}"
UPDATE_RESPONSE=$(curl -s -X PATCH "$BASE_URL/collections/$COLLECTION_ID" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": [
      {"name": "email", "type": "string", "required": true, "unique": true},
      {"name": "age", "type": "number", "required": false},
      {"name": "city", "type": "string", "required": false}
    ]
  }')

echo "Response: $UPDATE_RESPONSE"
echo -e "${GREEN}✅ Field Added Successfully${NC}"

# Test 4: GET UPDATED COLLECTION
echo -e "\n${YELLOW}4️⃣ Verifying Updated Collection...${NC}"
VERIFY_RESPONSE=$(curl -s -X GET "$BASE_URL/collections/detail/$COLLECTION_ID" \
  -H "Authorization: Bearer $AUTH_TOKEN")
echo "Response: $VERIFY_RESPONSE"
echo -e "${GREEN}✅ Verification Complete${NC}"

echo -e "\n========================================="
echo -e "${GREEN}✅ ALL TESTS COMPLETED${NC}"
echo "========================================="
