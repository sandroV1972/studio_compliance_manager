#!/bin/sh
# ============================================
# Docker Startup Script
# ============================================
# Esegue migrazioni e inizializzazione prima di avviare l'app

set -e

echo "============================================"
echo "Starting Studio Compliance Manager"
echo "Environment: ${NODE_ENV}"
echo "============================================"

# 1. Wait for database
echo ""
echo "Waiting for database..."
until nc -z postgres 5432; do
  echo "  Database not ready, waiting..."
  sleep 2
done
echo "✓ Database is ready"

# 2. Run migrations
echo ""
echo "Running database migrations..."
npx prisma migrate deploy
echo "✓ Migrations completed"

# 3. Initialize super admin
echo ""
echo "Initializing super admin..."
node scripts/init-superadmin.js
echo "✓ Super admin initialized"

# 4. Seed database with global templates
echo ""
echo "Seeding database with global templates..."
npx prisma db seed
echo "✓ Database seeded"

# 5. Start application
echo ""
echo "============================================"
echo "Starting Next.js application..."
echo "============================================"
exec node server.js
