@echo off
title MedStudy - Subir cambios a GitHub
cls
echo ================================================================
echo  MedStudy - Sincronizacion de Produccion con GitHub (main)
echo ================================================================
echo.
set "PATH=C:\Users\gaost\AppData\Local\Microsoft\WinGet\Packages\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\cmd;C:\Program Files\GitHub CLI;C:\Users\gaost\AppData\Local\Programs\Git Credential Manager;%PATH%"

echo Repositorio: https://github.com/gaostolaza2007-dotcom/lyoh
echo Rama: main
echo.
echo Subiendo commits al repositorio remoto...
echo.

git push origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================================
    echo  [OK] Cambios subidos exitosamente a GitHub.
    echo  Netlify detectara el commit e iniciara el despliegue automatico.
    echo ================================================================
) else (
    echo.
    echo ================================================================
    echo  [AVISO] Si se solicito autorizacion, inicia sesion en GitHub
    echo  o ejecuta: gh auth login
    echo ================================================================
)

echo.
pause
