@echo off
REM VerbaDeck Desktop Shortcut Creator
REM This launches the PowerShell script to create the shortcut

title VerbaDeck Shortcut Creator
color 0B

echo.
echo ========================================
echo    Creating VerbaDeck Desktop Shortcut
echo ========================================
echo.

REM Run the PowerShell script
PowerShell.exe -ExecutionPolicy Bypass -File "%~dp0create-desktop-shortcut.ps1"

REM Check if it worked
if exist "%USERPROFILE%\Desktop\VerbaDeck.lnk" (
    echo.
    echo ========================================
    echo    Shortcut created successfully!
    echo ========================================
    echo.
) else (
    echo.
    echo ========================================
    echo    ERROR: Could not create shortcut
    echo ========================================
    echo.
    pause
)
