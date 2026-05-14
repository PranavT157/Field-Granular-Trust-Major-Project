@echo off
echo.
echo ========================================
echo MediSync Shield Quick Start
echo ========================================
echo.

echo Checking for Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js found

echo.
echo Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo ERROR: Backend installation failed
    pause
    exit /b 1
)
echo ✓ Backend dependencies installed
cd ..

echo.
echo Installing frontend dependencies...
cd frontend
call npm install
if errorlevel 1 (
    echo ERROR: Frontend installation failed
    pause
    exit /b 1
)
echo ✓ Frontend dependencies installed
cd ..

echo.
echo ========================================
echo Installation complete!
echo ========================================
echo.
echo To start the project:
echo.
echo 1. In one terminal:
echo    cd backend
echo    npm start
echo.
echo 2. In another terminal:
echo    cd frontend
echo    npm run dev
echo.
echo 3. Open http://localhost:5173 in your browser
echo.
pause
