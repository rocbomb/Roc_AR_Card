@echo off
chcp 65001 >nul
title AR动漫卡片召唤器

echo ========================================
echo   AR动漫卡片召唤器 - HTTPS服务器
echo ========================================
echo.

cd /d "%~dp0"

:: 检查证书文件
if not exist "cert.crt" (
    echo [!] 未找到证书文件，正在生成...
    call npx mkcert create-ca
    call npx mkcert create-cert
    echo.
)

echo [*] 启动 HTTPS 服务器...
echo.
echo 访问地址:
echo   - 本机: https://127.0.0.1:3000
echo   - 手机: https://你的电脑IP:3000
echo.
echo 提示: 首次访问需点击"高级"-"继续访问"
echo 按 Ctrl+C 停止服务器
echo ========================================
echo.

npx http-server -S -C cert.crt -K cert.key -p 3000

pause
