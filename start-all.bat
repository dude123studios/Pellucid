@echo off
REM Pellucid AI Alignment Data Marketplace - Windows Startup Script
REM This script starts all services: Python APIs and Next.js frontend

echo 🚀 Starting Pellucid AI Alignment Data Marketplace...
echo ==================================================

REM Check if we're in the right directory
if not exist "pellucid-marketplace" (
    echo [ERROR] Please run this script from the hackcmu directory
    echo [ERROR] Expected structure: hackcmu/pellucid-marketplace and hackcmu/pellucid-labeling-api
    pause
    exit /b 1
)

if not exist "pellucid-labeling-api" (
    echo [ERROR] Please run this script from the hackcmu directory
    echo [ERROR] Expected structure: hackcmu/pellucid-marketplace and hackcmu/pellucid-labeling-api
    pause
    exit /b 1
)

REM Kill any existing processes on our ports
echo [INFO] Cleaning up existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8001') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8002') do taskkill /f /pid %%a >nul 2>&1

REM Check Python installation
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo [ERROR] Please install Python 3.8+ first
    pause
    exit /b 1
)

REM Check Node.js installation
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo [ERROR] Please install Node.js 18+ first
    pause
    exit /b 1
)

REM Check if virtual environment exists for Python services
if not exist "pellucid-labeling-api\venv" (
    echo [WARNING] Python virtual environment not found. Creating one...
    cd pellucid-labeling-api
    python -m venv venv
    call venv\Scripts\activate.bat
    pip install --upgrade pip
    pip install -r requirements.txt
    cd ..
    echo [SUCCESS] Python virtual environment created and dependencies installed
)

REM Start Python services
echo [INFO] Starting Python backend services...

REM Start Python Labeling API (port 8000)
echo [INFO] Starting Python Labeling API on port 8000...
cd pellucid-labeling-api
start "Python Labeling API" cmd /k "venv\Scripts\activate.bat && python main.py"
cd ..

REM Start Python Privacy Service (port 8001)
echo [INFO] Starting Python Privacy Service on port 8001...
cd pellucid-labeling-api
start "Python Privacy Service" cmd /k "venv\Scripts\activate.bat && python privacy_service.py"
cd ..

REM Start Python Visualization Service (port 8002)
echo [INFO] Starting Python Visualization Service on port 8002...
cd pellucid-labeling-api
start "Python Visualization Service" cmd /k "venv\Scripts\activate.bat && python visualization_service.py"
cd ..

REM Wait for Python services to start
echo [INFO] Waiting for Python services to initialize...
timeout /t 10 /nobreak >nul

REM Start Next.js frontend
echo [INFO] Starting Next.js frontend on port 3000...
cd pellucid-marketplace

REM Check if node_modules exists
if not exist "node_modules" (
    echo [WARNING] Node modules not found. Installing dependencies...
    npm install
)

REM Start Next.js in development mode
start "Next.js Frontend" cmd /k "npm run dev"
cd ..

REM Wait for Next.js to start
echo [INFO] Waiting for Next.js to initialize...
timeout /t 10 /nobreak >nul

REM Success message
echo.
echo 🎉 All services started successfully!
echo ==================================================
echo ✅ Python Labeling API:     http://localhost:8000
echo ✅ Python Privacy Service:  http://localhost:8001
echo ✅ Python Visualization:    http://localhost:8002
echo ✅ Next.js Frontend:        http://localhost:3000
echo.
echo 📊 Visualization Demo:      http://localhost:3000/visualization-demo
echo 🏪 Marketplace:             http://localhost:3000/marketplace
echo 📈 Dashboard:               http://localhost:3000/dashboard
echo 🔐 Auth:                    http://localhost:3000/auth
echo.
echo Press any key to exit...
pause >nul
