#!/bin/sh
# Railway startup: use public DB URL if internal unreachable, wait for DB, then start

# Prefer DATABASE_PUBLIC_URL when set (fixes "Can't reach database server" on Railway)
if [ -n "$DATABASE_PUBLIC_URL" ]; then
  echo "Using DATABASE_PUBLIC_URL (Railway public connection)"
  export DATABASE_URL="$DATABASE_PUBLIC_URL"
fi

# Brief delay for DB to be ready after deploy
echo "Waiting 5s for database..."
sleep 5

# Schema sync and start
echo "Running prisma generate..."
npx prisma generate

echo "Running prisma db push..."
npx prisma db push --accept-data-loss

echo "Starting server..."
exec npm start
