# Fix SSH Key Permissions on Windows
$path = "c:\Users\vaibhav ghoshi\OneDrive\Desktop\AI\AI-companion.pem"

# Remove inheritance
icacls.exe $path /c /t /Inheritance:d

# Remove all users
icacls.exe $path /c /t /Remove:g "BUILTIN\Administrators"
icacls.exe $path /c /t /Remove:g "BUILTIN\Users"
icacls.exe $path /c /t /Remove:g "NT AUTHORITY\Authenticated Users"
icacls.exe $path /c /t /Remove:g "NT AUTHORITY\SYSTEM"
icacls.exe $path /c /t /Remove:g "DESKTOP-PGBUR1I\CodexSandboxUsers"

# Grant current user read access
$currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
icacls.exe $path /c /t /Grant:r "$($currentUser):(R)"

Write-Host "Permissions fixed! You can now run the SSH command again."
