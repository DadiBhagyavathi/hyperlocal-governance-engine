@echo off
echo ============================================================
echo   HyperGov AI Setup ^& Launch
echo ============================================================

REM ── Step 1: Create Python venv ────────────────────────────────
if not exist "ml_service\venv" (
    echo [1/6] Creating Python virtual environment...
    python -m venv ml_service\venv
) else (
    echo [1/6] Python venv already exists
)

REM ── Step 2: Install Python dependencies ──────────────────────
echo [2/6] Installing Python dependencies...
call ml_service\venv\Scripts\activate.bat
pip install -r ml_service\requirements.txt --quiet

REM ── Step 3+4: Generate datasets and train ALL models ──────────
echo [3/6] Generating datasets (if missing)...
python ml_service\training\generate_project_data.py
python ml_service\training\generate_complaints_5k.py

echo [4/6] Training ALL ML models (classifier, delay, budget, clustering)...
python ml_service\training\train_all.py

REM ── Step 5: Start ML service in background ────────────────────
echo [5/6] Starting ML service on port 8000...
start "HyperGov ML Service" cmd /k "call ml_service\venv\Scripts\activate.bat && cd ml_service\api && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak > nul

REM ── Step 6: Start Agent service in background ─────────────────
echo [6/6] Starting Agent service on port 8001...
start "HyperGov Agent" cmd /k "call ml_service\venv\Scripts\activate.bat && cd agent && uvicorn agent_api:app --host 0.0.0.0 --port 8001 --reload"

timeout /t 2 /nobreak > nul

REM ── Start Node.js backend ─────────────────────────────────────
echo Starting Node.js backend on port 3000...
start "HyperGov Backend" cmd /k "npm start"

echo.
echo ============================================================
echo   All services started!
echo   Node.js  : http://localhost:3000
echo   ML API   : http://localhost:8000/docs
echo   Agent API: http://localhost:8001/docs
echo   AI Page  : http://localhost:3000/ai-dashboard.html
echo ============================================================
pause
