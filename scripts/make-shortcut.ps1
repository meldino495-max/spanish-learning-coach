# 生成无黑框启动快捷方式（直接指向 Electron，不依赖 VBScript）
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$electron = Join-Path $root 'node_modules\electron\dist\electron.exe'
$ws = New-Object -ComObject WScript.Shell
$lnkPath = Join-Path $root '多语言学习教练.lnk'
$sc = $ws.CreateShortcut($lnkPath)
$sc.TargetPath = $electron
$sc.Arguments = '"' + $root + '"'
$sc.WorkingDirectory = $root
$sc.IconLocation = "$electron,0"
$sc.WindowStyle = 7
$sc.Description = '多语言学习教练'
$sc.Save()
if (Test-Path -LiteralPath $lnkPath) { Write-Output "OK: $lnkPath" } else { Write-Output 'FAILED' }
