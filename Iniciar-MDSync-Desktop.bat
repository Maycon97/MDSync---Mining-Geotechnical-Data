@echo off
title MDSync Geotecnia - Desktop
cd /d "%~dp0"

if exist "%~dp0MDSync-Geotecnia.exe" (
    start "" "%~dp0MDSync-Geotecnia.exe"
    exit /b 0
)

if exist "%~dp0dist\index.html" (
    start "" msedge.exe --app="http://localhost:5173"
    exit /b 0
)

start "" "https://maycon97.github.io/MDSync---Mining-Geotechnical-Data/"

