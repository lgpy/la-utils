#!/bin/bash

# --- Configuration ---
PROD_HOST="192.168.1.84"
PROD_PORT="5433"
PROD_DB="la-utils-prod"
PROD_USER="lgpy"

DEV_HOST="192.168.1.84"
DEV_PORT="5432"
DEV_DB="la-utils-dev"
DEV_USER="lgpy"

DUMP_FILE="prod_dump.sql"

# --- Dump production database ---
echo "Dumping production database..."
pg_dump -U "$PROD_USER" -h "$PROD_HOST" -p "$PROD_PORT" -d "$PROD_DB" -Fc -f "$DUMP_FILE"
if [ $? -ne 0 ]; then
  echo "pg_dump failed."
  exit 1
fi

# --- Restore dump to dev database (clears existing objects) ---
echo "Restoring dump to dev database..."
pg_restore -U "$DEV_USER" -h "$DEV_HOST" -p "$DEV_PORT" -d "$DEV_DB" --clean "$DUMP_FILE"

# --- Delete dump file ---
echo "Deleting dump file..."
rm -f "$DUMP_FILE"

echo "Done!"
