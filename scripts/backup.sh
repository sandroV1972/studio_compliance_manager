#!/bin/bash
# ============================================
# Database Backup Script
# ============================================
# Esegue backup automatico del database PostgreSQL
# con rotazione basata su retention days

set -e

# Variabili d'ambiente
BACKUP_DIR=${BACKUP_DIR:-/backups}
POSTGRES_USER=${POSTGRES_USER:-compliance_user}
POSTGRES_DB=${POSTGRES_DB:-studio_compliance}
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}

# Timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/backup_${POSTGRES_DB}_${TIMESTAMP}.sql.gz"

echo "============================================"
echo "Starting backup: $(date)"
echo "Database: ${POSTGRES_DB}"
echo "Backup file: ${BACKUP_FILE}"
echo "============================================"

# Crea directory backup se non esiste
mkdir -p ${BACKUP_DIR}

# Esegui backup con compressione
PGPASSWORD=${POSTGRES_PASSWORD} pg_dump \
  -h postgres \
  -U ${POSTGRES_USER} \
  -d ${POSTGRES_DB} \
  --verbose \
  --format=plain \
  | gzip > ${BACKUP_FILE}

# Verifica successo
if [ $? -eq 0 ]; then
    echo "✓ Backup completed successfully"
    echo "  File size: $(du -h ${BACKUP_FILE} | cut -f1)"
else
    echo "✗ Backup failed!"
    exit 1
fi

# Pulizia backup vecchi
echo ""
echo "Cleaning old backups (retention: ${RETENTION_DAYS} days)..."
find ${BACKUP_DIR} -name "backup_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete
echo "✓ Cleanup completed"

# Lista backup esistenti
echo ""
echo "Available backups:"
ls -lh ${BACKUP_DIR}/backup_*.sql.gz 2>/dev/null || echo "  No backups found"

echo ""
echo "============================================"
echo "Backup completed: $(date)"
echo "============================================"
