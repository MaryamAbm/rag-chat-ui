@echo off
echo === RAG Chat UI Setup ===
echo.

echo [1/4] Installing dependencies...
npm install
if errorlevel 1 (echo ERROR: npm install failed && pause && exit /b 1)

echo.
echo [2/4] Initializing Git repository...
git init
git add .
git commit -m "feat: initial project scaffold with React, Vite, and Tailwind CSS"

echo.
echo [3/4] Creating feature branch...
git checkout -b feature/static-layout

echo.
echo [4/4] Done! Start the dev server with:
echo   npm run dev
echo.
pause
