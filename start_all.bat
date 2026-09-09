@echo off
setlocal
cd /d "%~dp0"
echo Starting Flask AI service on port 5000...
start "Sahayak Flask AI" cmd /k "cd /d "%~dp0flask_ai" && python app.py"
timeout /t 2 /nobreak >nul
echo Starting Node/Express on port 3001...
start "Sahayak Node" cmd /k "cd /d "%~dp0node_backend" && npm start"
echo.
echo Open http://127.0.0.1:3001/
