@echo off
cd /d "%~dp0"

echo Starting CodePlay Studios dev servers (frontend + tools backend)...
start "CodePlay Dev Server" cmd /k "npm run dev"

echo Waiting for the site to come up...
timeout /t 6 /nobreak >nul

start "" http://localhost:5173

echo.
echo The site should now be open in your browser.
echo A separate "CodePlay Dev Server" window is running the servers -
echo leave it open while you work. Close that window (or Ctrl+C in it)
echo to stop everything.
echo.
pause
