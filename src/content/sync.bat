@echo off
chcp 65001 >nul
set "DIR=%~dp0"
:loop
if exist "%DIR%package.json" goto run
set "DIR=%DIR%..\"
goto loop
:run
cd /d "%DIR%"
node scripts\sync-images.mjs --push
echo.
pause
