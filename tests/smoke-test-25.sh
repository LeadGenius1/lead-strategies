#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# NEXUS OS — 25-POINT PRE-LAUNCH SMOKE TEST
# March 7 Launch Readiness Check
# ═══════════════════════════════════════════════════════════════

API="https://api.aileadstrategies.com"
WEB="https://aileadstrategies.com"
PASS=0
FAIL=0
WARN=0

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO="$(dirname "$SCRIPT_DIR")"

p() { printf "  %-3s %-44s " "$1." "$2"; }
ok()   { echo "PASS"; PASS=$((PASS+1)); }
fail() { echo "FAIL -- $1"; FAIL=$((FAIL+1)); }
warn_() { echo "WARN -- $1"; WARN=$((WARN+1)); }

echo "======================================================="
echo "  NEXUS OS -- 25-POINT PRE-LAUNCH SMOKE TEST"
echo "  $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "======================================================="
echo ""

# Fetch health once, reuse
health_body=$(curl -s --max-time 10 "$API/health")
health_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$API/health")

# Helper to extract JSON with node
jq_() {
  echo "$health_body" | node -e "
    let d='';
    process.stdin.on('data',c=>d+=c);
    process.stdin.on('end',()=>{
      try { const j=JSON.parse(d); const v=$1; process.stdout.write(String(v===undefined||v===null?'null':v)); }
      catch(e) { process.stdout.write('err'); }
    });
  " 2>/dev/null
}

# --- 1. Health endpoint ---
p 1 "Backend health returns 200+ok"
hs=$(jq_ "j.status")
if [ "$health_code" = "200" ] && [ "$hs" = "ok" ]; then ok; else fail "code=$health_code status=$hs"; fi

# --- 2. Feature flags ---
p 2 "ENABLE_NEXUS + MARKET_STRATEGY = true"
fn=$(jq_ "j.features.ENABLE_NEXUS")
fm=$(jq_ "j.features.ENABLE_MARKET_STRATEGY")
if [ "$fn" = "true" ] && [ "$fm" = "true" ]; then ok; else fail "NEXUS=$fn MARKET=$fm"; fi

# --- 3. Signup validation ---
p 3 "POST /auth/signup empty body -> 400"
c=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -X POST -H "Content-Type: application/json" -d '{}' "$API/api/auth/signup")
if [ "$c" = "400" ]; then ok; else fail "got $c"; fi

# --- 4. Signup with valid data ---
p 4 "POST /auth/signup valid data -> 201 or 409"
c=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -X POST -H "Content-Type: application/json" \
  -d "{\"email\":\"smoketest-${RANDOM}@test.ails.com\",\"password\":\"SmokeTest123!\",\"name\":\"Smoke\"}" \
  "$API/api/auth/signup")
if [ "$c" = "201" ] || [ "$c" = "409" ]; then ok; else fail "got $c"; fi

# --- 5. Protected route without token ---
p 5 "GET /business-profile -> 401 (no auth)"
c=$(curl -s -o /dev/null -w "%{http_code}" --max-time 8 "$API/api/v1/business-profile")
if [ "$c" = "401" ]; then ok; else fail "got $c"; fi

# --- 6. Login with bad credentials ---
p 6 "POST /auth/login bad creds -> 401"
c=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -X POST -H "Content-Type: application/json" \
  -d '{"email":"nobody@test.com","password":"wrong"}' "$API/api/auth/login")
if [ "$c" = "401" ]; then ok; else fail "got $c"; fi

# --- 7. All Nexus protected APIs return 401 ---
p 7 "7 Nexus auth-protected APIs -> 401"
all_ok=true
for ep in business-profile business-profile/status scheduler execution/history assistant/greeting nexus/features market-strategy/history; do
  c=$(curl -s -o /dev/null -w "%{http_code}" --max-time 8 "$API/api/v1/$ep")
  if [ "$c" != "401" ]; then all_ok=false; fi
done
if $all_ok; then ok; else fail "not all 401"; fi

# --- 8. Nexus public APIs ---
p 8 "Nexus public APIs -> 200"
all_ok=true
for ep in nexus/orchestrator/health nexus/orchestrator/status nexus/context; do
  c=$(curl -s -o /dev/null -w "%{http_code}" --max-time 8 "$API/api/v1/$ep")
  if [ "$c" != "200" ]; then all_ok=false; fi
done
if $all_ok; then ok; else fail "not all 200"; fi

# --- 9. Orchestrator health shows providers ---
p 9 "Orchestrator health lists AI providers"
oh=$(curl -s --max-time 10 "$API/api/v1/nexus/orchestrator/health")
hp=$(echo "$oh" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{const j=JSON.parse(d);console.log(j.providers?'yes':'no')}catch{console.log('no')}})" 2>/dev/null)
if [ "$hp" = "yes" ]; then ok; else warn_ "no providers key"; fi

# --- 10. SSE scheduler feed endpoint ---
p 10 "SSE /scheduler/feed -> 401 (auth needed)"
c=$(curl -s -o /dev/null -w "%{http_code}" --max-time 8 "$API/api/v1/scheduler/feed")
if [ "$c" = "401" ]; then ok; else fail "got $c"; fi

# --- 11. Discovery trigger protected ---
p 11 "POST /business-profile/discover -> 401"
c=$(curl -s -o /dev/null -w "%{http_code}" --max-time 8 -X POST -H "Content-Type: application/json" -d '{}' "$API/api/v1/business-profile/discover")
if [ "$c" = "401" ]; then ok; else fail "got $c"; fi

# --- 12. Market strategy create protected ---
p 12 "POST /market-strategy -> 401"
c=$(curl -s -o /dev/null -w "%{http_code}" --max-time 8 -X POST -H "Content-Type: application/json" -d '{}' "$API/api/v1/market-strategy")
if [ "$c" = "401" ]; then ok; else fail "got $c"; fi

# --- 13. Video create tier-gated ---
p 13 "POST /video/create -> 401 (tier-gated)"
c=$(curl -s -o /dev/null -w "%{http_code}" --max-time 8 -X POST -H "Content-Type: application/json" -d '{}' "$API/api/v1/video/create")
if [ "$c" = "401" ]; then ok; else fail "got $c"; fi

# --- 14. CORS headers ---
p 14 "CORS headers on health endpoint"
cors=$(curl -s -I --max-time 8 -H "Origin: https://aileadstrategies.com" "$API/health" 2>/dev/null | grep -i "access-control" | head -1)
if [ -n "$cors" ]; then ok; else warn_ "no CORS header"; fi

# --- 15. Frontend homepage ---
p 15 "Frontend homepage -> 200"
c=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "$WEB")
if [ "$c" = "200" ]; then ok; else fail "got $c"; fi

# --- 16. Frontend login ---
p 16 "Frontend /login -> 200"
c=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "$WEB/login")
if [ "$c" = "200" ]; then ok; else fail "got $c"; fi

# --- 17. Frontend signup ---
p 17 "Frontend /signup -> 200"
c=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "$WEB/signup")
if [ "$c" = "200" ]; then ok; else fail "got $c"; fi

# --- 18. All 7 Nexus panel pages ---
p 18 "All 7 Nexus panel pages -> 200"
all_ok=true
for page in nexus/feed nexus/strategy nexus/outreach nexus/prospects nexus/websites nexus/videos nexus/settings; do
  c=$(curl -s -o /dev/null -w "%{http_code}" --max-time 12 "$WEB/$page")
  if [ "$c" != "200" ]; then all_ok=false; fi
done
if $all_ok; then ok; else fail "some panels not 200"; fi

# --- 19. Nexus setup page ---
p 19 "Nexus /nexus/setup -> 200"
c=$(curl -s -o /dev/null -w "%{http_code}" --max-time 12 "$WEB/nexus/setup")
if [ "$c" = "200" ]; then ok; else fail "got $c"; fi

# --- 20. Nexus command center ---
p 20 "Nexus /nexus/command-center -> 200"
c=$(curl -s -o /dev/null -w "%{http_code}" --max-time 12 "$WEB/nexus/command-center")
if [ "$c" = "200" ]; then ok; else fail "got $c"; fi

# --- 21. Admin login page ---
p 21 "Admin /admin/login -> 200"
c=$(curl -s -o /dev/null -w "%{http_code}" --max-time 12 "$WEB/admin/login")
if [ "$c" = "200" ]; then ok; else fail "got $c"; fi

# --- 22. All database models healthy ---
p 22 "All 7 database models healthy"
all_ok=$(echo "$health_body" | node -e "
  let d='';
  process.stdin.on('data',c=>d+=c);
  process.stdin.on('end',()=>{
    try{const c=JSON.parse(d).checks;console.log(Object.values(c).every(v=>v==='ok')?'yes':'no')}
    catch{console.log('no')}
  });
" 2>/dev/null)
if [ "$all_ok" = "yes" ]; then ok; else fail "some models unhealthy"; fi

# --- 23. Backend syntax: 14 Phase 2-7 files ---
p 23 "Backend syntax: 14 Phase 2-7 files"
syntax_ok=true
for f in \
  backend/src/services/nexus2/discoveryAgent.js \
  backend/src/services/nexus2/discoveryWorker.js \
  backend/src/routes/businessProfile.js \
  backend/src/services/nexus2/scheduler/engine.js \
  backend/src/services/nexus2/scheduler/constants.js \
  backend/src/services/nexus2/profileBridge.js \
  backend/src/services/nexus2/assistant/service.js \
  backend/src/services/nexus2/assistant/greeting.js \
  backend/src/routes/nexus-chat.js \
  backend/src/routes/nexus-features.js \
  backend/src/routes/scheduler.js \
  backend/src/routes/execution.js \
  backend/src/routes/assistant.js \
  backend/src/services/marketStrategy/constants.js; do
  node --check "$REPO/$f" 2>/dev/null
  if [ $? -ne 0 ]; then syntax_ok=false; fi
done
if $syntax_ok; then ok; else fail "syntax errors"; fi

# --- 24. nexusFeatures.js defines 8 panels ---
p 24 "nexusFeatures.js defines 8 panels"
count=$(grep -c "id: '" "$REPO/lib/nexusFeatures.js" 2>/dev/null)
if [ "$count" = "8" ]; then ok; else fail "got $count panels"; fi

# --- 25. No hardcoded secrets in backend routes ---
p 25 "No hardcoded API keys in backend routes"
secrets=$(grep -rn 'sk-[a-zA-Z0-9]\{20,\}\|AKIA[A-Z0-9]\{16\}\|ghp_[a-zA-Z0-9]\{36\}' "$REPO/backend/src/routes/" 2>/dev/null | head -3)
if [ -z "$secrets" ]; then ok; else fail "hardcoded secrets found"; fi

echo ""
echo "======================================================="
TOTAL=$((PASS+FAIL+WARN))
echo "  RESULTS: $PASS PASS / $FAIL FAIL / $WARN WARN (of $TOTAL)"
echo "======================================================="
if [ "$FAIL" -eq 0 ]; then
  echo "  LAUNCH READY -- All critical checks passed"
else
  echo "  NOT READY -- Fix $FAIL failure(s) before launch"
fi
echo ""
exit $FAIL
