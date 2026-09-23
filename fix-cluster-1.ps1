$ErrorActionPreference = "Stop"

Write-Host "WARP CONTROL - READABILITY PATCH"

$cssPath = "src/app/globals.css"

if (-not (Test-Path $cssPath)) {
    throw "Could not find src/app/globals.css"
}

$patch = @"

/* WARP CONTROL - READABILITY PATCH */

header,
.app-header,
.topbar,
.top-bar {
  color: #f8fafc !important;
}

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

header svg,
.app-header svg,
.topbar svg,
.top-bar svg {
  color: #cbd5e1 !important;
  stroke: currentColor;
}

header kbd,
.app-header kbd,
.topbar kbd,
.top-bar kbd {
  color: #cbd5e1 !important;
  background: #1e2631 !important;
  border-color: #334155 !important;
}

aside h1,
aside h2,
aside strong {
  color: #f8fafc !important;
}

aside p {
  color: #94a3b8 !important;
}

/* END WARP CONTROL - READABILITY PATCH */

"@

$current = Get-Content $cssPath -Raw

if ($current -notmatch "WARP CONTROL - READABILITY PATCH") {
    Add-Content -Path $cssPath -Value $patch -Encoding utf8
    Write-Host "Readability patch added."
} else {
    Write-Host "Readability patch already exists."
}

Write-Host "PATCH COMPLETE"
