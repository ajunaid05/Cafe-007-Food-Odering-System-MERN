@echo off
echo ==========================================
echo Setting up Food Ordering App for Windows
echo ==========================================

echo.
echo [1/2] Installing Backend Dependencies...
cd backend
call npm.cmd install
if %ERRORLEVEL% NEQ 0 (
    echo Error installing backend dependencies!
    pause
    exit /b %ERRORLEVEL%
)
cd ..

echo.
echo [2/2] Installing Frontend Dependencies...
cd frontend
call npm.cmd install
if %ERRORLEVEL% NEQ 0 (
    echo Error installing frontend dependencies!
    pause
    exit /b %ERRORLEVEL%
)
cd ..

echo.
echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo To start the servers, you can run:
echo Backend: cd backend ^& npm.cmd start
echo Frontend: cd frontend ^& npm.cmd start
echo.
pause
