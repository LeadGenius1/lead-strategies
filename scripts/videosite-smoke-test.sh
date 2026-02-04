#!/bin/bash
# Quick VideoSite.AI smoke test
# Usage: TOKEN=<your_jwt> ./scripts/videosite-smoke-test.sh

API_URL="${API_URL:-https://api.aileadstrategies.com}"

echo "🎬 VideoSite.AI Test Suite"
echo "=========================="

if [ -z "$TOKEN" ]; then
  echo "⚠️  Set TOKEN env var with a valid JWT, e.g.:"
  echo "   TOKEN=eyJ... ./scripts/videosite-smoke-test.sh"
  exit 1
fi

echo ""
echo "1. Testing GET /api/v1/videosite/videos..."
curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/api/v1/videosite/videos" | head -c 500
echo -e "\n"

echo "2. Testing GET /api/v1/videosite/analytics?period=7d..."
curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/api/v1/videosite/analytics?period=7d" | head -c 500
echo -e "\n"

echo "3. Testing GET /api/v1/videosite/earnings..."
curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/api/v1/videosite/earnings" | head -c 500
echo -e "\n"

echo "✅ Tests complete!"
