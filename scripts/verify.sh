#!/bin/bash
BACKEND="http://localhost:3001"

echo "=========================================="
echo "AI Lead Strategies - Verification Script"
echo "=========================================="

echo -e "\n1. Health check..."
curl -s $BACKEND/health

echo -e "\n\n2. Auth /me (no token - expect 401)..."
curl -s -w "\nStatus: %{http_code}" $BACKEND/api/auth/me

echo -e "\n\n3. Auth /me (with token)..."
if [ -n "$TOKEN" ]; then
  curl -s -H "Authorization: Bearer $TOKEN" $BACKEND/api/auth/me
else
  echo "⚠️  Set TOKEN env var first: export TOKEN=your_jwt"
fi

echo -e "\n\n4. Rate limit test (150 requests)..."
echo -n "Response codes: "
for i in {1..150}; do 
  curl -s -o /dev/null -w "%{http_code} " $BACKEND/api/auth/me
  if [ $((i % 50)) -eq 0 ]; then echo ""; fi
done

echo -e "\n\n=========================================="
echo "Verification complete!"
echo "=========================================="
