# Windows Build Script with Elevated Privileges
# Run this script as Administrator if the normal build fails

Write-Host "Building ZTMM Assessment for Windows..." -ForegroundColor Green

# Clean previous builds
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "Cleaned dist directory" -ForegroundColor Yellow
}

if (Test-Path "dist-electron") {
    Remove-Item -Recurse -Force "dist-electron" 
    Write-Host "Cleaned dist-electron directory" -ForegroundColor Yellow
}

# Build Angular app
Write-Host "Building Angular application..." -ForegroundColor Cyan
ng build --configuration production

if ($LASTEXITCODE -eq 0) {
    Write-Host "Angular build successful" -ForegroundColor Green
    
    # Build Electron app for Windows only
    Write-Host "Building Electron application for Windows..." -ForegroundColor Cyan
    electron-builder --win --config.npmRebuild=false --config.nodeGypRebuild=false
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Windows build completed successfully!" -ForegroundColor Green
        Write-Host "Output files are in the dist-electron directory" -ForegroundColor Yellow
    } else {
        Write-Host "Electron build failed with exit code $LASTEXITCODE" -ForegroundColor Red
    }
} else {
    Write-Host "Angular build failed with exit code $LASTEXITCODE" -ForegroundColor Red
}
