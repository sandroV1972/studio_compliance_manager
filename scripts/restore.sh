#!/bin/bash
# ============================================
# Database Restore Script
# ============================================
# Ripristina database da backup

set -e

# Variabili
BACKUP_DIR=${BACKUP_DIR:-/backups}
POSTGRES_USER=${POSTGRES_USER:-compliance_user}
POSTGRES_DB=${POSTGRES_DB:-studio_compliance}

# Controlla argomento
if [ -z "$1" ]; then
    echo "Usage: ./restore.sh <backup-file>"
    echo ""
    echo "Available backups:"
    ls -lh ${BACKUP_DIR}/backup_*.sql.gz
    exit 1
fi

BACKUP_FILE=$1

# Verifica esistenza file
if [ ! -f "${BACKUP_FILE}" ]; then
    echo "Error: Backup file not found: ${BACKUP_FILE}"
    exit 1
fi

echo "============================================"
echo "WARNING: Database Restore"
echo "============================================"
echo "This will OVERWRITE the current database!"
echo "Database: ${POSTGRES_DB}"
echo "Backup file: ${BACKUP_FILE}"
echo ""
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Restore cancelled"
    exit 0
fi

echo ""
echo "Starting restore..."

# Drop database e ricrea
PGPASSWORD=${POSTGRES_PASSWORD} psql -h postgres -U ${POSTGRES_USER} -c "DROP DATABASE IF EXISTS ${POSTGRES_DB};"
PGPASSWORD=${POSTGRES_PASSWORD} psql -h postgres -U ${POSTGRES_USER} -c "CREATE DATABASE ${POSTGRES_DB};"

# Ripristina da backup
gunzip -c ${BACKUP_FILE} | PGPASSWORD=${POSTGRES_PASSWORD} psql -h postgres -U ${POSTGRES_USER} -d ${POSTGRES_DB}

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Restore completed successfully!"
else
    echo ""
    echo "✗ Restore failed!"
    exit 1
fi

echo "============================================"
