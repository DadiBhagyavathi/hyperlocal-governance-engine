@echo off
echo ========================================
echo   HyperGov - Starting Server
echo ========================================
echo.
echo Installing dependencies (if needed)...
call npm install
echo.
echo Starting server on http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.
call npm start
