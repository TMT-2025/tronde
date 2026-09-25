# Script đóng gói Production Package cho EXAM MIXER
$ErrorActionPreference = "Stop"

$workspaceRoot = $PSScriptRoot + "\.."
Set-Location $workspaceRoot

$pkgDir = Join-Path $workspaceRoot "release\EXAM-MIXER"
if (Test-Path $pkgDir) {
    Remove-Item -Recurse -Force $pkgDir
}

New-Item -ItemType Directory -Force -Path $pkgDir | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $pkgDir "output\sandbox") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $pkgDir "templates") | Out-Null

# Copy production artifacts
Copy-Item -Recurse -Force (Join-Path $workspaceRoot "dist") (Join-Path $pkgDir "dist")
Copy-Item -Force (Join-Path $workspaceRoot "package.json") (Join-Path $pkgDir "package.json")
Copy-Item -Force (Join-Path $workspaceRoot "package-lock.json") (Join-Path $pkgDir "package-lock.json")
Copy-Item -Force (Join-Path $workspaceRoot "README.md") (Join-Path $pkgDir "README.md")
Copy-Item -Force (Join-Path $workspaceRoot "USER_GUIDE.md") (Join-Path $pkgDir "USER_GUIDE.md")
Copy-Item -Force (Join-Path $workspaceRoot "START.bat") (Join-Path $pkgDir "START.bat")
Copy-Item -Force (Join-Path $workspaceRoot ".env.example") (Join-Path $pkgDir ".env.example")
Copy-Item -Force (Join-Path $workspaceRoot "VERSION") (Join-Path $pkgDir "VERSION")
Copy-Item -Force (Join-Path $workspaceRoot "DeSauTron.docx") (Join-Path $pkgDir "DeSauTron.docx")
Copy-Item -Force (Join-Path $workspaceRoot "templates\DeSauTron.docx") (Join-Path $pkgDir "templates\DeSauTron.docx")
New-Item -ItemType File -Force -Path (Join-Path $pkgDir "output\sandbox\.gitkeep") | Out-Null

Write-Host "Production package created successfully at: $pkgDir"
Get-ChildItem -Path $pkgDir | Select-Object Name, Length
