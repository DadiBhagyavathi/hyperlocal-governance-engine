@echo off
echo ========================================
echo   HyperGov - Quick Start
echo ========================================
echo.
echo Starting server...
start /B npm start
echo.
echo Waiting for server to start...
timeout /t 3 /nobreak > nul
echo.
echo Opening browser...
start http://localhost:3000
echo.
echo ========================================
echo Server is running at http://localhost:3000
echo Press any key to stop the server...
echo ========================================
pause > nul
taskkill /F /IM node.exe
