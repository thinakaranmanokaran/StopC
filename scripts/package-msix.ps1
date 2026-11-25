<#
.SYNOPSIS
    Builds and packages StopC as an MSIX for Microsoft Store submission or local sideload testing.

.DESCRIPTION
    1. Builds the Tauri app with `--no-bundle --features msix` and `VITE_MSIX_BUILD=true` (unless -SkipBuild is passed).
    2. Stages `stopc.exe`, rendered `AppxManifest.xml`, and Store PNG icons into a clean staging folder.
    3. Packs an `.msix` using `makeappx.exe` from the Windows 10/11 SDK.
    4. Optionally signs the `.msix` with a self-signed cert (-SelfSign) or an existing PFX (-CertPfxPath) for local testing.
       For Microsoft Partner Center uploads, leave it unsigned — Microsoft signs it automatically after certification.
#>
[CmdletBinding()]
param(
    [string]$IdentityName = $(if ($env:MSIX_IDENTITY_NAME) { $env:MSIX_IDENTITY_NAME } else { "ThinakaranManokaran.StopC" }),
    [string]$Publisher = $(if ($env:MSIX_PUBLISHER) { $env:MSIX_PUBLISHER } else { "CN=Thinakaran Manokaran" }),
    [string]$PublisherDisplayName = $(if ($env:MSIX_PUBLISHER_DISPLAY_NAME) { $env:MSIX_PUBLISHER_DISPLAY_NAME } else { "Thinakaran Manokaran" }),
    [string]$Version = "",
    [ValidateSet("x64", "arm64")]
    [string]$Arch = "x64",
    [string]$OutputDir = "",
    [switch]$SkipBuild,
    [switch]$SelfSign,
    [string]$CertPfxPath = "",
    [string]$CertPassword = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$TauriDir = Join-Path $RepoRoot "src-tauri"
$TauriConfPath = Join-Path $TauriDir "tauri.conf.json"
$ManifestTemplatePath = Join-Path $TauriDir "msix\AppxManifest.template.xml"

if (-not (Test-Path $TauriConfPath)) {
    throw "Cannot find tauri.conf.json at $TauriConfPath"
}
if (-not (Test-Path $ManifestTemplatePath)) {
    throw "Cannot find AppxManifest.template.xml at $ManifestTemplatePath"
}

$TauriConf = Get-Content $TauriConfPath -Raw | ConvertFrom-Json
if ([string]::IsNullOrWhiteSpace($Version)) {
    $rawVersion = $TauriConf.version
    $parts = $rawVersion.Split(".")
    if ($parts.Count -eq 3) {
        $Version = "$rawVersion.0"
    } elseif ($parts.Count -eq 4) {
        $Version = $rawVersion
    } else {
        throw "Unsupported version '$rawVersion' in tauri.conf.json; expected X.Y.Z or X.Y.Z.W"
    }
}

$TargetTriple = if ($Arch -eq "arm64") { "aarch64-pc-windows-msvc" } else { "x86_64-pc-windows-msvc" }

if (-not $SkipBuild) {
    Write-Host "==> Building StopC (MSIX mode: VITE_MSIX_BUILD=true, --features msix, target=$TargetTriple)..." -ForegroundColor Cyan
    Push-Location $RepoRoot
    try {
        $prevMsixEnv = $env:VITE_MSIX_BUILD
        $env:VITE_MSIX_BUILD = "true"
        try {
            npm run tauri build -- --no-bundle --target $TargetTriple --features msix
            if ($LASTEXITCODE -ne 0) {
                throw "Tauri build failed with exit code $LASTEXITCODE"
            }
        } finally {
            if ($null -eq $prevMsixEnv) {
                Remove-Item Env:VITE_MSIX_BUILD -ErrorAction SilentlyContinue
            } else {
                $env:VITE_MSIX_BUILD = $prevMsixEnv
            }
        }
    } finally {
        Pop-Location
    }
}

$CandidateExes = @(
    (Join-Path $TauriDir "target\$TargetTriple\release\stopc.exe"),
    (Join-Path $TauriDir "target\release\stopc.exe")
)
$ExePath = $CandidateExes | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $ExePath) {
    throw "Built executable not found. Checked: $($CandidateExes -join ', ')"
}

if ([string]::IsNullOrWhiteSpace($OutputDir)) {
    $OutputDir = Join-Path $TauriDir "target\msix"
}
$StagingDir = Join-Path $OutputDir "staging-$Arch"
$AssetsDir = Join-Path $StagingDir "Assets"

if (Test-Path $StagingDir) {
    Remove-Item $StagingDir -Recurse -Force
}
New-Item -ItemType Directory -Path $AssetsDir -Force | Out-Null

# Copy main executable
Copy-Item $ExePath (Join-Path $StagingDir "stopc.exe") -Force

# Copy Store/Tile PNGs already generated in src-tauri/icons
$IconsDir = Join-Path $TauriDir "icons"
$RequiredIcons = @(
    "StoreLogo.png",
    "Square44x44Logo.png",
    "Square71x71Logo.png",
    "Square150x150Logo.png",
    "Wide310x150Logo.png",
    "Square310x310Logo.png"
)
foreach ($icon in $RequiredIcons) {
    $srcIcon = Join-Path $IconsDir $icon
    if (-not (Test-Path $srcIcon)) {
        throw "Required Store icon missing: $srcIcon"
    }
    Copy-Item $srcIcon (Join-Path $AssetsDir $icon) -Force
}

# Render AppxManifest.xml with XML escaping
function Escape-Xml([string]$Value) {
    return [System.Security.SecurityElement]::Escape($Value)
}

$ManifestContent = Get-Content $ManifestTemplatePath -Raw
$ManifestContent = $ManifestContent `
    -replace "__IDENTITY_NAME__", (Escape-Xml $IdentityName) `
    -replace "__PUBLISHER__", (Escape-Xml $Publisher) `
    -replace "__VERSION__", (Escape-Xml $Version) `
    -replace "__ARCH__", (Escape-Xml $Arch) `
    -replace "__PUBLISHER_DISPLAY_NAME__", (Escape-Xml $PublisherDisplayName)

$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Join-Path $StagingDir "AppxManifest.xml"), $ManifestContent, $Utf8NoBom)

function Find-WindowsSdkTool([string]$ToolName, [string]$ToolArch = "x64") {
    $cmd = Get-Command $ToolName -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }

    $kitsBin = "C:\Program Files (x86)\Windows Kits\10\bin"
    if (Test-Path $kitsBin) {
        $sdkDirs = Get-ChildItem -Path $kitsBin -Directory |
            Where-Object { $_.Name -match '^\d+\.\d+\.\d+\.\d+$' } |
            Sort-Object { [version]$_.Name } -Descending
        foreach ($dir in $sdkDirs) {
            $candidate = Join-Path $dir.FullName "$ToolArch\$ToolName"
            if (Test-Path $candidate) { return $candidate }
        }
    }
    return $null
}

$MakeAppx = Find-WindowsSdkTool "makeappx.exe"
if (-not $MakeAppx) {
    throw "makeappx.exe not found. Install the Windows 10/11 SDK (or run inside GitHub Actions windows-latest)."
}

$MsixPath = Join-Path $OutputDir "StopC_${Version}_${Arch}.msix"
if (Test-Path $MsixPath) {
    Remove-Item $MsixPath -Force
}

Write-Host "==> Packing MSIX using $MakeAppx..." -ForegroundColor Cyan
& $MakeAppx pack /d $StagingDir /p $MsixPath /o
if ($LASTEXITCODE -ne 0) {
    throw "makeappx.exe failed with exit code $LASTEXITCODE"
}

if ($SelfSign) {
    $SignTool = Find-WindowsSdkTool "signtool.exe"
    if (-not $SignTool) {
        throw "signtool.exe not found. Install the Windows 10/11 SDK to self-sign."
    }

    $DevPfx = Join-Path $OutputDir "StopC-dev.pfx"
    $DevPwd = if ($CertPassword) { $CertPassword } else { "stopc-dev-cert" }
    $SecurePwd = ConvertTo-SecureString -String $DevPwd -Force -AsPlainText

    Write-Host "==> Creating local self-signed code signing certificate for '$Publisher'..." -ForegroundColor Cyan
    $Cert = New-SelfSignedCertificate `
        -Type Custom `
        -Subject $Publisher `
        -KeyUsage DigitalSignature `
        -FriendlyName "StopC Local Dev Cert" `
        -CertStoreLocation "Cert:\CurrentUser\My" `
        -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.3", "2.5.29.19={text}")

    Export-PfxCertificate -Cert $Cert -FilePath $DevPfx -Password $SecurePwd | Out-Null

    Write-Host "==> Signing $MsixPath with self-signed certificate..." -ForegroundColor Cyan
    & $SignTool sign /fd SHA256 /f $DevPfx /p $DevPwd $MsixPath
    if ($LASTEXITCODE -ne 0) {
        throw "signtool.exe failed with exit code $LASTEXITCODE"
    }

    Write-Host ""
    Write-Host "Local testing tip:" -ForegroundColor Yellow
    Write-Host "  Trust this cert once (elevated PowerShell) before running Add-AppxPackage:" -ForegroundColor Yellow
    Write-Host "    Import-Certificate -FilePath (Export-Certificate -Cert (Get-ChildItem Cert:\CurrentUser\My\$($Cert.Thumbprint)) -FilePath '$OutputDir\StopC-dev.cer').FullName -CertStoreLocation Cert:\LocalMachine\TrustedPeople"
    Write-Host "    Add-AppxPackage -Path '$MsixPath'"
} elseif (-not [string]::IsNullOrWhiteSpace($CertPfxPath)) {
    $SignTool = Find-WindowsSdkTool "signtool.exe"
    if (-not $SignTool) {
        throw "signtool.exe not found."
    }
    Write-Host "==> Signing $MsixPath with $CertPfxPath..." -ForegroundColor Cyan
    if ($CertPassword) {
        & $SignTool sign /fd SHA256 /f $CertPfxPath /p $CertPassword $MsixPath
    } else {
        & $SignTool sign /fd SHA256 /f $CertPfxPath $MsixPath
    }
    if ($LASTEXITCODE -ne 0) {
        throw "signtool.exe failed with exit code $LASTEXITCODE"
    }
}

Write-Host ""
Write-Host "MSIX package ready: $MsixPath" -ForegroundColor Green
