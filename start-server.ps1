# Quiz App Local Server Starter
# PowerShell script to start a local HTTP server

Write-Host "🚀 Starting Quiz App Local Server..." -ForegroundColor Green
Write-Host ""

# Check if Python is available
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found!" -ForegroundColor Red
    Write-Host "Please install Python from: https://python.org" -ForegroundColor Yellow
    Write-Host "Make sure to check 'Add Python to PATH' during installation" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "🌐 Server will start on: http://localhost:8000" -ForegroundColor Cyan
Write-Host "📁 Serving files from current directory" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

try {
    # Start the server
    python -m http.server 8000
} catch {
    Write-Host "❌ Failed to start server: $_" -ForegroundColor Red
    Read-Host "Press Enter to exit"
}
