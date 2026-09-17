# Epyxis Security System Launcher (PowerShell)
# Launches epyxis-backend on Port 5000, epyxis-app frontend, and epyxis-agent Windows Endpoint Agent

param (
    [switch]$SkipAgent
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "         EPYXIS ENTERPRISE ACCESS PORTAL LAUNCHER          " -ForegroundColor White -BackgroundColor DarkBlue
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

$backendPath = Join-Path $PSScriptRoot "epyxis-backend"
$frontendPath = Join-Path $PSScriptRoot "epyxis-app"
$agentPath = Join-Path $PSScriptRoot "epyxis-agent"

Write-Host "[1/3] Starting Epyxis Backend Server on Port 5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendPath'; `$env:PORT=5000; Write-Host 'Starting Epyxis Backend on Port 5000...' -ForegroundColor Green; node index.js"

Start-Sleep -Seconds 2

Write-Host "[2/3] Starting Epyxis Frontend Web App (Vite Dev Server)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendPath'; Write-Host 'Starting Epyxis Frontend Dev Server...' -ForegroundColor Green; npm run dev"

if (-not $SkipAgent -and (Test-Path $agentPath)) {
    Start-Sleep -Seconds 1
    Write-Host "[3/3] Building & Starting Epyxis Windows Endpoint Agent (Tray App)..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$agentPath'; Write-Host 'Building & Running Epyxis Agent Tray App...' -ForegroundColor Green; dotnet run --project EpyxisAgentTray/EpyxisAgentTray.csproj"
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  ALL SYSTEM SERVICES LAUNCHED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "  Backend API:      http://localhost:5000" -ForegroundColor White
Write-Host "  Frontend Web:     http://localhost:5173" -ForegroundColor White
Write-Host "  Endpoint Agent:   EpyxisAgent Tray App (.NET 8)" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Green
Write-Host ""

