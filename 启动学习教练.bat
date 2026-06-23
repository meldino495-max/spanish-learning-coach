@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  🇪🇸 西语母语冲刺教练
echo  正在启动...
echo.
if not exist "node_modules\" (
  echo 首次运行，正在安装依赖...
  call npm install
)
start http://localhost:5173
call npm run dev
