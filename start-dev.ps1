# Quizify Dev Startup Script
Write-Host "Starting Quizify Dev Servers..." -ForegroundColor Cyan

# Start backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$(Get-Location)\backend'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 2

# Start frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$(Get-Location)\frontend'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "Servers starting..." -ForegroundColor Green
Write-Host "  Backend:  http://localhost:3001" -ForegroundColor Yellow
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Open http://localhost:3000 to start!" -ForegroundColor Cyan
