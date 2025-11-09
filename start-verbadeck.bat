@echo off
title VerbaDeck - Starting...
color 0A

echo.
echo ========================================
echo    VerbaDeck Launcher
echo ========================================
echo.
echo Starting VerbaDeck server and client...
echo.

REM Change to the script's directory
cd /d "%~dp0"

REM Start the application (runs both server and client)
npm run dev

REM If npm run dev fails, pause so you can see the error
if errorlevel 1 (
    echo.
    echo ========================================
    echo    ERROR: Failed to start VerbaDeck
    echo ========================================
    echo.
    pause
)
