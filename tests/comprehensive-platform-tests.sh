#!/bin/bash

echo "=========================================="
echo "  COMPREHENSIVE PLATFORM TESTS"
echo "=========================================="

BASE_URL="${1:-https://api.aileadstrategies.com}"
FRONTEND_URL="${2:-https://aileadstrategies.com}"

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Test function
test_endpoint() {
  local name="$1"
  local url="$2"
  local expected_code="$3"
  local method="${4:-GET}"

  printf "  %-40s " "$name"

  if [ "$method" = "POST" ]; then
    http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -X POST -H "Content-Type: application/json" -d '{}' "$url")
  else
    http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url")
  fi

  if [ "$http_code" = "$expected_code" ]; then
    echo "PASS ($http_code)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    return 0
  else
    echo "FAIL (got $http_code, expected $expected_code)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    return 1
  fi
}

# Fetch health response once
health_response=$(curl -s --max-time 10 "$BASE_URL/health")

# Extract JSON field using node (Windows-compatible, no /dev/stdin)
json_field() {
  node -e "try{const d=JSON.parse(process.argv[1]);const v=$1;process.stdout.write(String(v===undefined||v===null?'null':v))}catch(e){process.stdout.write('null')}" "$health_response"
}

echo ""
echo "LAYER 1: HEALTH + FEATURE FLAGS"
echo "------------------------------------------"

printf "  %-40s " "Health endpoint"
health_status=$(json_field "d.status")

if [ "$health_status" = "ok" ]; then
  echo "PASS (status: ok)"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo "FAIL (status: $health_status)"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""
echo "  Health checks:"
node -e "try{const d=JSON.parse(process.argv[1]);Object.entries(d.checks||{}).forEach(([k,v])=>console.log('    '+k+': '+v))}catch(e){console.log('    (parse error)')}" "$health_response"
echo ""

echo "  Feature flags:"
node -e "try{const d=JSON.parse(process.argv[1]);Object.entries(d.features||{}).forEach(([k,v])=>console.log('    '+k+': '+v))}catch(e){console.log('    (parse error)')}" "$health_response"
echo ""

echo "LAYER 2: API ENDPOINT TESTS"
echo "------------------------------------------"

test_endpoint "Auth signup (empty body)" "$BASE_URL/api/auth/signup" "400" "POST"
test_endpoint "Leads API (no auth)" "$BASE_URL/api/v1/leads" "401"
test_endpoint "Campaigns API (no auth)" "$BASE_URL/api/v1/campaigns" "401"
test_endpoint "Websites API (no auth)" "$BASE_URL/api/v1/websites" "401"
test_endpoint "Videos API (no auth)" "$BASE_URL/api/v1/videos" "401"
test_endpoint "Channels API (no auth)" "$BASE_URL/api/v1/channels" "401"
test_endpoint "CRM API (no auth)" "$BASE_URL/api/v1/crm" "401"

echo ""
echo "LAYER 3: FRONTEND PAGE TESTS"
echo "------------------------------------------"

test_endpoint "Homepage" "$FRONTEND_URL" "200"
test_endpoint "Login page" "$FRONTEND_URL/login" "200"
test_endpoint "Signup page" "$FRONTEND_URL/signup" "200"

echo ""
echo "LAYER 4: DATABASE MODEL TESTS (via /health)"
echo "------------------------------------------"

check_model() {
  local name="$1"
  local key="$2"

  printf "  %-40s " "$name"
  val=$(node -e "try{const d=JSON.parse(process.argv[1]);const v=d.checks&&d.checks['$key'];process.stdout.write(String(v===undefined||v===null?'null':v))}catch(e){process.stdout.write('null')}" "$health_response")

  if [ "$val" = "ok" ]; then
    echo "PASS"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  elif [ "$val" = "null" ] || [ -z "$val" ]; then
    echo "SKIP (flag disabled)"
  else
    echo "FAIL ($val)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
}

check_model "Database connection" "database"
check_model "User model (auth)" "prisma_user"
check_model "Website model (LeadSite.IO)" "websites_model"
check_model "Video model (VideoSite.AI)" "videos_model"
check_model "Lead model (LeadSite.AI)" "leads_model"
check_model "Conversation model (ClientContact)" "conversations_model"
check_model "CRM Contact model (UltraLead)" "crm_model"

echo ""
echo "=========================================="
echo "  RESULTS: $TESTS_PASSED passed, $TESTS_FAILED failed"
echo "=========================================="

if [ "$TESTS_FAILED" -eq 0 ]; then
  echo "  ALL TESTS PASSED - SAFE TO PROCEED"
  exit 0
else
  echo "  TESTS FAILED - DO NOT DEPLOY"
  exit 1
fi
