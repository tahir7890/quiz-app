@echo off
echo Starting Quiz App Local Server...
echo.
echo This will start a local server on http://localhost:8000
echo.
echo Requirements:
echo - Python 3.x must be installed
echo - Python must be in your PATH
echo.
echo If you don't have Python, download it from: https://python.org
echo.
pause
echo.
echo Starting server...
python -m http.server 8000
pause
