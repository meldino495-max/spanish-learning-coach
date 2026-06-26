@echo off
cd /d "%~dp0"
title Language Learning Coach - Debug

echo ============================================================
echo  Debug mode: shows the full startup process.
echo  The window stays open after Electron exits.
echo ============================================================
echo.

set "ELECTRON=node_modules\electron\dist\electron.exe"

if not exist "node_modules" (
  echo [setup] Installing dependencies...
  call npm install
)

if not exist "%ELECTRON%" (
  echo [setup] Desktop runtime missing, reinstalling...
  call npm install
)

if not exist "dist\index.html" (
  echo [build] Building application files...
  call npm run build
)

echo [run] Launching Electron (the app window will open)...
echo.
"%ELECTRON%" "%CD%"

echo.
echo Electron exited with code %errorlevel%.
echo Full log: .app-data\logs\app.log
pause
