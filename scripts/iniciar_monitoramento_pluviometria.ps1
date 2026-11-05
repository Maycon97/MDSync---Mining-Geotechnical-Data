# PowerShell Launcher para o Monitoramento Full-Time de Pluviometria Itaminas
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "ITAMINAS - Monitoramento Full-Time Pluviometria"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   ITAMINAS GEOTECNIA - MONITORAMENTO FULL-TIME DE PLUVIOMETRIA" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "Iniciando processo observador em segundo plano..." -ForegroundColor Yellow

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $scriptDir "..")

python scripts\watch_pluviometria.py

