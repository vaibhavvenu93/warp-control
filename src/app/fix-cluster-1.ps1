$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================"
Write-Host " WARP CONTROL - READABILITY PATCH"
Write-Host "========================================"
Write-Host ""

$cssPath = "src/app/globals.css"

if (-not (Test-Path $cssPath)) {
    throw "Could not find src/app/globals.css"
}

$patch = @'

/* ==========================================================
   WARP CONTROL - READABILITY PATCH
   ========================================================== */

/* Sidebar branding */
aside h1,
aside h2,
aside strong,
.sidebar h1,
.sidebar h2,
.sidebar strong {
  color: #f8fafc !important;
}

aside p,
.sidebar p {
  color: #94a3b8 !important;
}

/* Top application header */
header,
.app-header,
.topbar,
.top-bar {
  color: #f8fafc !important;
}

/* Search / command bar */
header input,
.app-header input,
.topbar input,
.top-bar input {
  color: #f8fafc !important;
  caret-color: #f8fafc !important;
}

header input::placeholder,
.app-header input::placeholder,
.topbar input::placeholder,
.top-bar input::placeholder {
  color: #cbd5e1 !important;
  opacity: 1 !important;
}

/* Header text */
header span,
header label,
header button,
.app-header span,
.app-header label,
.app-header button,
.topbar span,
.topbar label,
.topbar button,
.top-bar span,
.top-bar label,
.top-bar button {
  color: #cbd5e1 !important;
}

/* Icons */
header svg,
.app-header svg,
.topbar svg,
.top-bar svg {
  color: #cbd5e1 !important;
  stroke: currentColor;
}

/* Search container contrast */
header input,
.app-header input,
.topbar input,
.top-bar input {
  background-color: #151b23 !important;
  border-color: #334155 !important;
}

/* Keyboard shortcut */
header kbd,
.app-header kbd,
.topbar kbd,
.top-bar kbd {
  color: #cbd5e1 !important;
  background: #1e2631 !important;
  border-color: #334155 !important;
}

/* ==========================================================
   END READABILITY PATCH
   ========================================================== */

'@

$current = Get-Content $cssPath -Raw

if ($current -notmatch "WARP CONTROL - READABILITY PATCH") {
    Add-Content -Path $cssPath -Value $patch
    Write-Host "Header readability patch added."
}
else {
    Write-Host "Header readability patch already exists."
}

Write-Host ""
Write-Host "PATCH COMPLETE"
Write-Host ""