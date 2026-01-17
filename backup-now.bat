@echo off
echo ==========================================
echo   AI Lead Strategies - Manual Backup
echo ==========================================
echo.
echo Running backup sync to OneDrive and Google Drive...
echo.
powershell.exe -ExecutionPolicy Bypass -File "%~dp0scripts\auto-backup.ps1" -Force
echo.
echo ==========================================
echo   Backup Complete!
echo ==========================================
pause
