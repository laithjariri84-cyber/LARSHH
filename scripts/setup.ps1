# LARSSH local setup (Windows PowerShell)
# Usage: .\scripts\setup.ps1

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

function Require-Command($name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw @"
Required command '$name' was not found.

Install Node.js 20 LTS from https://nodejs.org
Then close and reopen PowerShell and run this script again.
"@
  }
}

Write-Host "==> Checking Node.js and npm" -ForegroundColor Cyan
Require-Command node
Require-Command npm
Write-Host ("Node " + (node -v))
Write-Host ("npm " + (npm -v))

if (-not (Test-Path ".env.local")) {
  Write-Host "==> Creating .env.local from .env.example" -ForegroundColor Cyan
  Copy-Item ".env.example" ".env.local"
}

$envContent = Get-Content ".env.local" -Raw
if ($envContent -match '\[project-ref\]|your-project-ref|your-supabase-anon-key') {
  throw @"
.env.local still contains placeholder values.

Edit .env.local with your Supabase credentials before running migrations:
  1. Supabase Dashboard -> Project Settings -> API
  2. Supabase Dashboard -> Project Settings -> Database
  3. Set DATABASE_URL (pooler, port 6543) and DIRECT_URL (direct, port 5432)
"@
}

Write-Host "==> Step 1/5: Installing dependencies" -ForegroundColor Cyan
npm install

Write-Host "==> Step 2/5: Validating Prisma schema" -ForegroundColor Cyan
npm run db:validate

Write-Host "==> Step 3/5: Generating Prisma Client" -ForegroundColor Cyan
npm run db:generate

Write-Host "==> Step 4/5: Running migrations" -ForegroundColor Cyan
npm run db:migrate:deploy

Write-Host "==> Step 5/5: Seeding database" -ForegroundColor Cyan
npm run db:seed

Write-Host ""
Write-Host "Setup complete. Start the development server with:" -ForegroundColor Green
Write-Host "  npm run dev" -ForegroundColor Green
Write-Host "  or" -ForegroundColor Green
Write-Host "  .\scripts\dev.ps1" -ForegroundColor Green
