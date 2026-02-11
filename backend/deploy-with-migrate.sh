#!/bin/bash
echo "=== Running Prisma DB Push ==="
npx prisma db push --accept-data-loss
echo "=== Prisma DB Push Complete ==="
echo "=== Starting Server ==="
npm start
