# Production Database Cleanup

## Problem

The production database has duplicate data from running the seed script:

- 4 users instead of 2 (includes demo users)
- 81 global deadline templates instead of 29 (duplicates)
- 2 organizations instead of 1 (includes demo org)

## Solution

Run the cleanup script on the production server to remove demo data and duplicates.

## Steps to Execute on Production Server

### 1. Connect to Production Server

```bash
ssh root@compliance.3jdigital.solutions
```

### 2. Navigate to Application Directory

```bash
cd /root/studio-compliance-manager
```

### 3. Upload Scripts to Server

From your local machine, copy the scripts:

```bash
scp scripts/production/check-prod-db.js root@compliance.3jdigital.solutions:/root/studio-compliance-manager/
scp scripts/production/cleanup-prod.js root@compliance.3jdigital.solutions:/root/studio-compliance-manager/
```

### 4. Check Current Database Status (Optional)

```bash
node check-prod-db.js
```

This will show:

- Current users count and details
- Template counts
- Organizations

### 5. Run Cleanup Script

```bash
node cleanup-prod.js
```

This will:

- Delete demo users: `admin@studiocompliance.it` and `demo@studiodentistico.it`
- Delete demo organization: "Studio Dentistico Rossi"
- Remove duplicate deadline templates

### 6. Verify Cleanup

```bash
node check-prod-db.js
```

Expected results after cleanup:

- **Users**: 2 (admin@3jdigital.solutions, alessandrovalenti.android@gmail.com)
- **Organizations**: 1 (Studio Dentistico Valenti)
- **Global Deadline Templates**: ~29

### 7. Restart Application (if needed)

```bash
pm2 restart studio-compliance
```

### 8. Clean Up Scripts (Optional)

```bash
rm check-prod-db.js cleanup-prod.js
```

## What Will Be Removed

- ❌ User: `admin@studiocompliance.it`
- ❌ User: `demo@studiodentistico.it`
- ❌ Organization: "Studio Dentistico Rossi"
- ❌ Duplicate deadline templates

## What Will Be Kept

- ✅ User: `admin@3jdigital.solutions`
- ✅ User: `alessandrovalenti.android@gmail.com`
- ✅ Organization: "Studio Dentistico Valenti"
- ✅ All production data (structures, people, roles, deadlines)
