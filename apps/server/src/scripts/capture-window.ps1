param(
  [Parameter(Mandatory = $true)]
  [string]$WindowTitle,

  [Parameter(Mandatory = $true)]
  [string]$OutputPath
)

$ErrorActionPreference = "Stop"

# Keep this file ASCII-only: Windows PowerShell 5 parses UTF-8 without BOM as the local code page.
# This fixed read-only backend only enumerates visible top-level windows and writes one PNG.
# It never evaluates Agent input as code and never writes outside OutputPath.
Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Runtime.InteropServices;

public static class OasisMindWindowCapture {
    [StructLayout(LayoutKind.Sequential)]
    public struct RECT {
        public int Left;
        public int Top;
        public int Right;
        public int Bottom;
    }

    [DllImport("user32.dll")]
    public static extern bool IsWindowVisible(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern bool IsIconic(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern bool GetWindowRect(IntPtr hWnd, out RECT rect);

    [DllImport("dwmapi.dll")]
    public static extern int DwmGetWindowAttribute(IntPtr hWnd, int attribute, out RECT rect, int size);

    [DllImport("user32.dll")]
    public static extern bool PrintWindow(IntPtr hWnd, IntPtr hdc, uint flags);
}
"@

$needle = $WindowTitle.Trim()
if (-not $needle) {
  throw "windowTitle must not be empty"
}

# [OM-FREEPLAY] Prefer an exact title, then allow one case-insensitive partial match.
# Dynamic browser titles remain usable while ambiguous matches are never chosen at random.
$candidates = @(Get-Process | Where-Object {
  $_.MainWindowHandle -ne 0 -and
  $_.MainWindowTitle -and
  [OasisMindWindowCapture]::IsWindowVisible([IntPtr]$_.MainWindowHandle) -and
  $_.MainWindowTitle.IndexOf($needle, [StringComparison]::OrdinalIgnoreCase) -ge 0
})

$exact = @($candidates | Where-Object {
  [String]::Equals($_.MainWindowTitle, $needle, [StringComparison]::OrdinalIgnoreCase)
})
if ($exact.Count -eq 1) {
  $target = $exact[0]
} elseif ($candidates.Count -eq 1) {
  $target = $candidates[0]
} elseif ($candidates.Count -eq 0) {
  throw "No visible window title contains '$needle'. Open the window or provide a more precise title."
} else {
  $titles = ($candidates | Select-Object -First 8 | ForEach-Object { "'$($_.MainWindowTitle)'" }) -join ", "
  throw "Window title '$needle' is ambiguous: $titles. Provide a more complete title."
}

$handle = [IntPtr]$target.MainWindowHandle
if ([OasisMindWindowCapture]::IsIconic($handle)) {
  throw "Window '$($target.MainWindowTitle)' is minimized. Restore it before capture."
}

# Prefer DWM extended frame bounds to exclude transparent shadows; fall back on old systems.
$rect = New-Object OasisMindWindowCapture+RECT
$dwmResult = [OasisMindWindowCapture]::DwmGetWindowAttribute(
  $handle,
  9,
  [ref]$rect,
  [Runtime.InteropServices.Marshal]::SizeOf([type][OasisMindWindowCapture+RECT])
)
if ($dwmResult -ne 0 -and -not [OasisMindWindowCapture]::GetWindowRect($handle, [ref]$rect)) {
  throw "Unable to read the window bounds"
}

$width = $rect.Right - $rect.Left
$height = $rect.Bottom - $rect.Top
if ($width -le 0 -or $height -le 0) {
  throw "Invalid window size: ${width}x${height}"
}

$outputDirectory = [IO.Path]::GetDirectoryName([IO.Path]::GetFullPath($OutputPath))
[IO.Directory]::CreateDirectory($outputDirectory) | Out-Null
$bitmap = New-Object Drawing.Bitmap($width, $height, [Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [Drawing.Graphics]::FromImage($bitmap)
$hdc = $graphics.GetHdc()
try {
  # PW_RENDERFULLCONTENT(2) captures most Chromium/WPF windows even when they are obscured.
  $captured = [OasisMindWindowCapture]::PrintWindow($handle, $hdc, 2)
} finally {
  $graphics.ReleaseHdc($hdc)
  $graphics.Dispose()
}
if (-not $captured) {
  $bitmap.Dispose()
  throw "PrintWindow failed. This app may block window capture; use desktop mode instead."
}

try {
  $bitmap.Save([IO.Path]::GetFullPath($OutputPath), [Drawing.Imaging.ImageFormat]::Png)
} finally {
  $bitmap.Dispose()
}

[ordered]@{
  title = $target.MainWindowTitle
  processId = $target.Id
  handle = $target.MainWindowHandle.ToString()
  width = $width
  height = $height
  captureBackend = "Win32.PrintWindow"
} | ConvertTo-Json -Compress
