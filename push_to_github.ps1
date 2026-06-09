Set-Location "c:\Users\vaibhav ghoshi\OneDrive\Desktop\AI"

# Initialize Git if not already done
git init

# Remove any inner .git folders if they exist (to prevent nested submodules)
if (Test-Path ".\companion-app\.git") { Remove-Item -Recurse -Force ".\companion-app\.git" }
if (Test-Path ".\companion-backend\.git") { Remove-Item -Recurse -Force ".\companion-backend\.git" }

# Create a root .gitignore
$gitignore = @"
node_modules/
.env
.DS_Store
dist/
build/
*.pem
"@
Set-Content -Path ".gitignore" -Value $gitignore

# Add all files
git add .

# Commit
git commit -m "Initial commit of full stack Companion App"

# Setup Remote and Push
git remote remove origin
git remote add origin https://github.com/Classyvaibhav06/GF.git
git branch -M main
git push -u origin main -f
