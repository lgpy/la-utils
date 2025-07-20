# PowerShell script to copy production DB to dev DB

# --- Configuration ---
$PROD_HOST = "192.168.1.84"
$PROD_PORT = "5433"
$PROD_DB = "la-utils-prod"
$PROD_USER = "lgpy"

$DEV_HOST = "192.168.1.84"
$DEV_PORT = "5432"
$DEV_DB = "la-utils-dev"
$DEV_USER = "lgpy"

$DUMP_FILE = "prod_dump.sql"

# --- Dump production database ---
Write-Host "Dumping production database..."
$dumpCmd = "pg_dump -U $PROD_USER -h $PROD_HOST -p $PROD_PORT -d $PROD_DB -Fc -f $DUMP_FILE"
$dumpResult = & cmd /c $dumpCmd
if ($LASTEXITCODE -ne 0) {
    Write-Host "pg_dump failed."
    exit 1
}

# --- Restore dump to dev database (clears existing objects) ---
Write-Host "Restoring dump to dev database..."
$restoreCmd = "pg_restore -U $DEV_USER -h $DEV_HOST -p $DEV_PORT -d $DEV_DB --clean $DUMP_FILE"
$restoreResult = & cmd /c $restoreCmd

# --- Delete dump file ---
Write-Host "Deleting dump file..."
Remove-Item -Force $DUMP_FILE

Write-Host "Done!"
