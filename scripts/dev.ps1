# LARSSH dev server (Windows PowerShell)
# Usage: .\scripts\dev.ps1

$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $PSScriptRoot)

if (-not (Test-Path ".env.local")) {
  Write-Error ".env.local is missing. Run .\scripts\setup.ps1 first or copy .env.example to .env.local"
}

if (-not (Test-Path "node_modules")) {
  Write-Error "node_modules is missing. Run npm install or .\scripts\setup.ps1 first"
}

npm run dev
