@echo off
cd /d "%~dp0"
title Language Learning Coach

rem ============================================================
rem  No longer depends on VBScript (disabled by default on
rem  Windows 11 24H2+). Ensures deps/build, then launches the
rem  Electron GUI app. Electron is a GUI program, so this
rem  console closes immediately after start - no black box.
rem  Startup log: .app-data\logs\app.log
rem ============================================================

set "ELECTRON=node_modules\electron\dist\electron.exe"

if not exist "node_modules" goto :install
if not exist "%ELECTRON%" goto :install
if not exist "dist\index.html" goto :build
goto :launch

:install
echo Installing dependencies (first run only, may take a few minutes)...
call npm install
if errorlevel 1 goto :fail

:build
if exist "dist\index.html" goto :launch
echo Preparing application files...
call npm run build
if errorlevel 1 goto :fail

:launch
start "" "%ELECTRON%" "%CD%"
exit /b 0

:fail
echo.
echo ============================================================
echo  Launch failed. Please screenshot the error above.
echo  You can also run the debug launcher to see full logs.
echo ============================================================
pause
