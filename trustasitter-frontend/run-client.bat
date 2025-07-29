@echo off
cd /d %~dp0
start cmd /k "npm run dev"
TIMEOUT /T 3 /NOBREAK >nul
start http://localhost:5173

