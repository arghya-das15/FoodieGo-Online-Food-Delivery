@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Node.js is not installed. Install Node.js 18+ first.
 pause
 exit /b 1
)
echo Starting FoodieGo...
node backend\server.js
pause
