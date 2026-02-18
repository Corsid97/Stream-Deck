@echo off
REM Change to the directory where this script lives (the project root)
cd /d "%~dp0"

echo ============================================
echo   DeckForge - Windows Installer Builder
echo ============================================
echo.

REM Skip code signing (not needed for unsigned builds)
set CSC_IDENTITY_AUTO_DISCOVERY=false

echo Working directory: %cd%
echo.

echo [1/4] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)

echo.
echo [2/4] Compiling main process...
call npx tsc -p tsconfig.main.json
if %errorlevel% neq 0 (
    echo ERROR: TypeScript compilation failed!
    pause
    exit /b 1
)

echo.
echo [3/4] Building renderer...
call npx vite build
if %errorlevel% neq 0 (
    echo ERROR: Vite build failed!
    pause
    exit /b 1
)

echo.
echo [4/4] Building Windows installer...
call npx electron-builder --win --config.win.signDllAndExe=false
if %errorlevel% neq 0 (
    echo ERROR: Electron builder failed!
    pause
    exit /b 1
)

echo.
echo ============================================
echo   BUILD COMPLETE!
echo   Installer is in the 'release' folder.
echo ============================================
echo.
pause
