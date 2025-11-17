@echo off
where tsx >nul 2>&1
if %errorlevel% == 0 (
    tsx "%~dp0src\bin\chk.ts" %*
) else (
    echo tsx is not installed globally. Installing...
    call :install_tsx
    tsx "%~dp0src\bin\chk.ts" %*
)
exit /b

:install_tsx
where pnpm >nul 2>&1
if %errorlevel% == 0 (
    pnpm add -g tsx
    exit /b
)

where yarn >nul 2>&1
if %errorlevel% == 0 (
    yarn global add tsx
    exit /b
)

where npm >nul 2>&1
if %errorlevel% == 0 (
    npm install -g tsx
    exit /b
)

echo No package manager found. Please install tsx manually.
exit /b