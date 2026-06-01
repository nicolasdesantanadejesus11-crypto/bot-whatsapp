@echo off
title SANTANA BOT

cd /d C:\Users\Nicolas\Downloads\bot

pm2 describe santana-bot >nul 2>&1

if %errorlevel% neq 0 (
    echo Iniciando bot...
    pm2 start index.js --name santana-bot
) else (
    echo Reiniciando bot...
    pm2 restart santana-bot
)

timeout /t 2 >nul

pm2 logs santana-bot