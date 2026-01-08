#!/bin/bash

# Database Cleanup Script for Railway
# This script connects to Railway PostgreSQL and cleans all user data

echo "⚠️  WARNING: This will delete ALL users and related data!"
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

# Get database URL from Railway
if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL environment variable not set"
    echo "Run: railway variables get DATABASE_URL"
    exit 1
fi

echo "Connecting to database..."
psql "$DATABASE_URL" -f cleanup-database.sql

if [ $? -eq 0 ]; then
    echo "✅ Database cleanup completed successfully!"
else
    echo "❌ Database cleanup failed!"
    exit 1
fi
