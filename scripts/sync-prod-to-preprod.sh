#!/bin/bash
# ============================================
# Copy Production to Pre-Production
# ============================================
# Script per copiare database PROD in PRE-PROD
# Da eseguire quotidianamente (cron job)

set -e

echo "============================================"
echo "PROD to PRE-PROD Sync - $(date)"
echo "============================================"

# 1. Backup database PROD
echo "Step 1: Creating PROD backup..."
PROD_BACKUP="/backups/preprod_sync_$(date +%Y%m%d_%H%M%S).sql.gz"

docker exec studio-compliance-db pg_dump \
  -U compliance_user \
  -d studio_compliance \
  --format=plain \
  | gzip > ${PROD_BACKUP}

echo "✓ PROD backup created: ${PROD_BACKUP}"

# 2. Stop PRE-PROD app
echo ""
echo "Step 2: Stopping PRE-PROD app..."
docker-compose -f docker-compose.preprod.yml stop app

# 3. Drop e ricrea PRE-PROD database
echo ""
echo "Step 3: Resetting PRE-PROD database..."
docker exec studio-compliance-preprod-db psql \
  -U preprod_user \
  -c "DROP DATABASE IF EXISTS studio_compliance_preprod;"

docker exec studio-compliance-preprod-db psql \
  -U preprod_user \
  -c "CREATE DATABASE studio_compliance_preprod;"

# 4. Restore backup in PRE-PROD
echo ""
echo "Step 4: Restoring PROD data to PRE-PROD..."
gunzip -c ${PROD_BACKUP} | docker exec -i studio-compliance-preprod-db psql \
  -U preprod_user \
  -d studio_compliance_preprod

echo "✓ Data restored"

# 5. Restart PRE-PROD app
echo ""
echo "Step 5: Restarting PRE-PROD app..."
docker-compose -f docker-compose.preprod.yml start app

# 6. Wait for health check
echo ""
echo "Step 6: Waiting for PRE-PROD to be healthy..."
sleep 10
docker-compose -f docker-compose.preprod.yml ps

echo ""
echo "============================================"
echo "✓ PROD to PRE-PROD sync completed!"
echo "Backup saved: ${PROD_BACKUP}"
echo "============================================"
