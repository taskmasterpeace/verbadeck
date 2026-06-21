@echo off
title VerbaDeck - Voice-Powered Presentations
color 0A

echo.
echo ========================================
echo    VerbaDeck Launcher
echo    Voice-Powered Presentations
echo ========================================
echo.
echo Starting VerbaDeck servers...
echo.

cd /d "%~dp0"

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Check if .env file exists
if not exist ".env" (
    echo.
    echo WARNING: .env file not found!
    echo Please create .env file with your API keys.
    echo See .env.example for template.
    echo.
    pause
    exit /b 1
)

echo.
echo [1/2] Starting server on port 3002...
echo [2/2] Starting client on port 5173...
echo.
echo VerbaDeck will open in your browser in 8 seconds...
echo.
echo Press Ctrl+C to stop VerbaDeck
echo.

REM Start the dev servers
start /B npm run dev

REM Wait 8 seconds for servers to start
timeout /t 8 /nobreak >nul

REM Open browser
start http://localhost:5173

echo.
echo ========================================
echo VerbaDeck is running!
echo ========================================
echo.
echo Client: http://localhost:5173
echo Server: http://localhost:3002
echo.
echo Keep this window open while using VerbaDeck
echo Press Ctrl+C to stop
echo.

REM Keep window open and wait for Ctrl+C
pause >nul
