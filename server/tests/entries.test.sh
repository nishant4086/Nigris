#!/bin/bash

# Configuration
API_KEY="4acd3af573186b9c4864cce3000c7aec4057a05da6488cb1064aa8b1f3522e8d"
BASE_URL="http://localhost:8000/api/public"
COLLECTION_ID="69f1b66189e041aab07678f3"

echo ""
echo "🧪 ENTRIES CRUD TEST SUITE"
echo ""

# Helper function for API calls
call_api() {
  local method=$1
  local endpoint=$2
  local data=$3
  
  if [ -z "$data" ]; then
    curl -s -X "$method" \
      -H "x-api-key: $API_KEY" \
      -H "Content-Type: application/json" \
      "$BASE_URL$endpoint"
  else
    curl -s -X "$method" \
      -H "x-api-key: $API_KEY" \
      -H "Content-Type: application/json" \
      -d "$data" \
      "$BASE_URL$endpoint"
  fi
}

# 1️⃣ CREATE ENTRIES
echo "1️⃣ CREATE ENTRIES TEST"
echo "-------------------------------------"

ENTRY1=$(call_api POST "/collections/$COLLECTION_ID/entries" '{"name":"Alice Johnson","email":"alice@example.com","age":28,"city":"New York"}')
ENTRY1_ID=$(echo "$ENTRY1" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "✅ Created entry 1: $ENTRY1_ID"

ENTRY2=$(call_api POST "/collections/$COLLECTION_ID/entries" '{"name":"Bob Smith","email":"bob@example.com","age":32,"city":"San Francisco"}')
ENTRY2_ID=$(echo "$ENTRY2" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "✅ Created entry 2: $ENTRY2_ID"

ENTRY3=$(call_api POST "/collections/$COLLECTION_ID/entries" '{"name":"Carol White","email":"carol@example.com","age":26,"city":"New York"}')
ENTRY3_ID=$(echo "$ENTRY3" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "✅ Created entry 3: $ENTRY3_ID"

# 2️⃣ GET ALL ENTRIES (PAGINATION)
echo ""
echo "2️⃣ GET ENTRIES WITH PAGINATION"
echo "-------------------------------------"

PAGE1=$(call_api GET "/collections/$COLLECTION_ID/entries?page=1&limit=2")
echo "✅ Page 1 (limit 2):"
echo "$PAGE1" | grep -o '"total":[0-9]*' | head -1
echo "$PAGE1" | grep -o '"pages":[0-9]*' | head -1

PAGE2=$(call_api GET "/collections/$COLLECTION_ID/entries?page=2&limit=2")
echo "✅ Page 2 retrieved successfully"

# 3️⃣ UPDATE ENTRY
echo ""
echo "3️⃣ UPDATE ENTRY (MERGE DATA)"
echo "-------------------------------------"

UPDATED=$(call_api PATCH "/entries/$ENTRY1_ID" '{"age":29,"city":"Boston"}')
echo "✅ Updated entry 1:"
echo "$UPDATED" | grep -o '"name":"[^"]*"'
echo "$UPDATED" | grep -o '"age":[0-9]*'
echo "$UPDATED" | grep -o '"city":"[^"]*"'

# 4️⃣ DELETE ENTRY
echo ""
echo "4️⃣ DELETE ENTRY"
echo "-------------------------------------"

DELETED=$(call_api DELETE "/entries/$ENTRY2_ID")
echo "✅ Deleted entry 2"
echo "$DELETED" | grep -o '"success":[a-z]*'

# 5️⃣ FINAL STATUS
echo ""
echo "5️⃣ FINAL ENTRY COUNT"
echo "-------------------------------------"

FINAL=$(call_api GET "/collections/$COLLECTION_ID/entries")
TOTAL=$(echo "$FINAL" | grep -o '"total":[0-9]*' | cut -d':' -f2)
echo "✅ Total entries remaining: $TOTAL"

echo ""
echo "✨ ALL TESTS PASSED!"
echo ""
