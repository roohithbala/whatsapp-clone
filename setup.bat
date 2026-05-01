@echo off
REM Installation Script for Windows - Setup WhatsApp User Module

echo.
echo ========================================
echo WhatsApp User Handling Module Setup
echo ========================================
echo.

REM Step 1: Install Backend Dependencies
echo [Step 1/4] Installing Backend Dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo Error: Failed to install backend dependencies
    pause
    exit /b 1
)
echo Done: Backend dependencies installed
cd ..

REM Step 2: Check for .env file
echo.
echo [Step 2/4] Checking for .env file...
if not exist "backend\.env" (
    echo Creating .env from .env.example...
    copy backend\.env.example backend\.env
    echo NOTE: Edit backend\.env with your JWT_SECRET
) else (
    echo .env file already exists
)

REM Step 3: Frontend Setup
echo.
echo [Step 3/4] Frontend Setup...
cd frontend
if not exist "node_modules" (
    echo Installing Frontend Dependencies...
    call npm install
)
cd ..
echo Done: Frontend ready

REM Step 4: Summary
echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next Steps:
echo 1. Edit backend\.env file with your JWT_SECRET
echo 2. Ensure MongoDB is running
echo 3. Open Terminal 1 (Command Prompt):
echo    cd backend
echo    npx nodemon server.js
echo.
echo 4. Open Terminal 2 (Command Prompt):
echo    cd frontend
echo    npm start
echo.
echo Testing:
echo - Register 2 users (Alice and Bob)
echo - Test login and logout
echo - Check MongoDB for user data
echo.
echo Documentation: See IMPLEMENTATION_SUMMARY.md
echo ========================================
pause
