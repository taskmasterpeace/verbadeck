# VerbaDeck Desktop Shortcut Creator
# Double-click this file to create a VerbaDeck shortcut on your desktop with custom icon

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   VerbaDeck Shortcut Creator" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get the script directory (where VerbaDeck is installed)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Paths
$batchFile = Join-Path $scriptDir "start-verbadeck-with-browser.bat"
$iconFile = Join-Path $scriptDir "client\public\icon.ico"
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "VerbaDeck.lnk"

# Check if batch file exists
if (-not (Test-Path $batchFile)) {
    Write-Host "ERROR: Cannot find $batchFile" -ForegroundColor Red
    Write-Host ""
    pause
    exit 1
}

# Create the shortcut
Write-Host "Creating shortcut..." -ForegroundColor Yellow
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $batchFile
$shortcut.WorkingDirectory = $scriptDir
$shortcut.Description = "Launch VerbaDeck - Voice-Driven Presentation System"
$shortcut.WindowStyle = 7  # Minimized

# Set custom icon if it exists
if (Test-Path $iconFile) {
    Write-Host "Setting custom icon..." -ForegroundColor Yellow
    $shortcut.IconLocation = $iconFile
} else {
    Write-Host "Warning: Icon file not found, using default icon" -ForegroundColor Yellow
}

# Save the shortcut
$shortcut.Save()

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   SUCCESS!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Desktop shortcut created at:" -ForegroundColor White
Write-Host "  $shortcutPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now:" -ForegroundColor White
Write-Host "  1. Close this window" -ForegroundColor Gray
Write-Host "  2. Go to your Desktop" -ForegroundColor Gray
Write-Host "  3. Double-click 'VerbaDeck' to launch!" -ForegroundColor Gray
Write-Host ""

pause
