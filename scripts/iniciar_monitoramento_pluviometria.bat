@echo off
chcp 65001 > nul
title ITAMINAS - Tunel de Monitoramento Full-Time de Pluviometria
echo ======================================================================
echo    ITAMINAS GEOTECNIA - MONITORAMENTO FULL-TIME DE PLUVIOMETRIA
echo ======================================================================
echo Iniciando daemon de observacao em tempo real de:
echo  - PLUVIOMETRIA.xlsx
echo  - Pluviometria.pbix
echo.
cd /d "%~dp0\.."
python scripts\watch_pluviometria.py
pause

