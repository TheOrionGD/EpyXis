@echo off
TITLE Epyxis Enterprise Security Launcher
COLOR 0A
echo ==========================================================
echo          EPYXIS ENTERPRISE ACCESS PORTAL LAUNCHER          
echo ==========================================================
echo.
echo [1/3] Launching Epyxis Backend on Port 5000...
start "Epyxis Backend Server (Port 5000)" cmd /k "cd /d %~dp0epyxis-backend && set PORT=5000 && node index.js"

timeout /t 2 /nobreak >nul

echo [2/3] Launching Epyxis Frontend Dev Server...
start "Epyxis Frontend Web App" cmd /k "cd /d %~dp0epyxis-app && npm run dev"

timeout /t 1 /nobreak >nul

echo [3/3] Launching Epyxis Windows Endpoint Agent (.NET 8 Tray)...
start "Epyxis Endpoint Agent Tray" cmd /k "cd /d %~dp0epyxis-agent && dotnet run --project EpyxisAgentTray/EpyxisAgentTray.csproj"

echo.
echo ==========================================================
echo  ALL SYSTEM SERVICES LAUNCHED SUCCESSFULLY!
echo  Backend API:      http://localhost:5000
echo  Frontend Web:     http://localhost:5173
echo  Endpoint Agent:   EpyxisAgent Tray App (.NET 8)
echo ==========================================================
echo.
pause

