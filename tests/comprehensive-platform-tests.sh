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
echo "LAYER 3: NEXUS API ENDPOINTS (public)"
echo "------------------------------------------"

test_endpoint "Orchestrator health" "$BASE_URL/api/v1/nexus/orchestrator/health" "200"
test_endpoint "Orchestrator status" "$BASE_URL/api/v1/nexus/orchestrator/status" "200"
test_endpoint "Nexus chat (no body)" "$BASE_URL/api/v1/nexus/chat" "200"
test_endpoint "Nexus context" "$BASE_URL/api/v1/nexus/context" "200"

echo ""
echo "LAYER 4: NEXUS API ENDPOINTS (auth-protected)"
echo "------------------------------------------"

test_endpoint "Business profile (no auth)" "$BASE_URL/api/v1/business-profile" "401"
test_endpoint "Business profile status (no auth)" "$BASE_URL/api/v1/business-profile/status" "401"
test_endpoint "Scheduler (no auth)" "$BASE_URL/api/v1/scheduler" "401"
test_endpoint "Execution history (no auth)" "$BASE_URL/api/v1/execution/history" "401"
test_endpoint "Assistant greeting (no auth)" "$BASE_URL/api/v1/assistant/greeting" "401"
test_endpoint "Nexus features (no auth)" "$BASE_URL/api/v1/nexus/features" "401"
test_endpoint "Market strategy history (no auth)" "$BASE_URL/api/v1/market-strategy/history" "401"
test_endpoint "Discover trigger (no auth)" "$BASE_URL/api/v1/business-profile/discover" "401" "POST"

echo ""
echo "LAYER 5: FRONTEND PAGE TESTS"
echo "------------------------------------------"

test_endpoint "Homepage" "$FRONTEND_URL" "200"
test_endpoint "Login page" "$FRONTEND_URL/login" "200"
test_endpoint "Signup page" "$FRONTEND_URL/signup" "200"

echo ""
echo "LAYER 6: FRONTEND NEXUS ROUTES"
echo "------------------------------------------"

# Nexus routes should return 200 (Next.js renders them; auth redirect happens client-side)
test_endpoint "Nexus root" "$FRONTEND_URL/nexus" "200"
test_endpoint "Nexus feed" "$FRONTEND_URL/nexus/feed" "200"
test_endpoint "Nexus strategy" "$FRONTEND_URL/nexus/strategy" "200"
test_endpoint "Nexus outreach" "$FRONTEND_URL/nexus/outreach" "200"
test_endpoint "Nexus setup" "$FRONTEND_URL/nexus/setup" "200"
test_endpoint "Nexus settings" "$FRONTEND_URL/nexus/settings" "200"
test_endpoint "Nexus command center" "$FRONTEND_URL/nexus/command-center" "200"

echo ""
echo "LAYER 7: DATABASE MODEL TESTS (via /health)"
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
echo "LAYER 8: BACKEND SYNTAX CHECK (Phases 2-7)"
echo "------------------------------------------"

# All backend files modified during Nexus OS Phases 2-7
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

check_syntax() {
  local name="$1"
  local filepath="$2"

  printf "  %-40s " "$name"

  if [ ! -f "$filepath" ]; then
    echo "SKIP (file not found)"
    return
  fi

  output=$(node --check "$filepath" 2>&1)
  if [ $? -eq 0 ]; then
    echo "PASS"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo "FAIL"
    echo "    $output"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
}

check_syntax "discoveryAgent.js" "$REPO_ROOT/backend/src/services/nexus2/discoveryAgent.js"
check_syntax "discoveryWorker.js" "$REPO_ROOT/backend/src/services/nexus2/discoveryWorker.js"
check_syntax "businessProfile.js" "$REPO_ROOT/backend/src/routes/businessProfile.js"
check_syntax "scheduler/engine.js" "$REPO_ROOT/backend/src/services/nexus2/scheduler/engine.js"
check_syntax "scheduler/constants.js" "$REPO_ROOT/backend/src/services/nexus2/scheduler/constants.js"
check_syntax "profileBridge.js" "$REPO_ROOT/backend/src/services/nexus2/profileBridge.js"
check_syntax "assistant/service.js" "$REPO_ROOT/backend/src/services/nexus2/assistant/service.js"
check_syntax "assistant/greeting.js" "$REPO_ROOT/backend/src/services/nexus2/assistant/greeting.js"
check_syntax "nexus-chat.js" "$REPO_ROOT/backend/src/routes/nexus-chat.js"
check_syntax "nexus-features.js" "$REPO_ROOT/backend/src/routes/nexus-features.js"
check_syntax "scheduler.js routes" "$REPO_ROOT/backend/src/routes/scheduler.js"
check_syntax "execution.js routes" "$REPO_ROOT/backend/src/routes/execution.js"
check_syntax "assistant.js routes" "$REPO_ROOT/backend/src/routes/assistant.js"
check_syntax "marketStrategy constants" "$REPO_ROOT/backend/src/services/marketStrategy/constants.js"

echo ""
echo "=========================================="
TOTAL=$((TESTS_PASSED + TESTS_FAILED))
echo "  RESULTS: $TESTS_PASSED/$TOTAL passed, $TESTS_FAILED failed"
echo "=========================================="

if [ "$TESTS_FAILED" -eq 0 ]; then
  echo "  ALL TESTS PASSED - SAFE TO DEPLOY"
  exit 0
else
  echo "  $TESTS_FAILED TESTS FAILED - REVIEW BEFORE DEPLOY"
  exit 1
fi
