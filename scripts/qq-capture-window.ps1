# Capture QQ window: force foreground then screen grab.
# Args: -OutDir <dir> [-Prefix qq]
# Exit: 0 wrote at least one png, 2 no window, 1 error
# Encoding: UTF-8 with BOM (required on Windows PowerShell)

param(
  [Parameter(Mandatory = $true)][string]$OutDir,
  [string]$Prefix = "qq"
)

$ErrorActionPreference = "Continue"
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Windows.Forms

$drawingAsm = [System.Drawing.Bitmap].Assembly.Location
$code = @'
using System;
using System.Text;
using System.Runtime.InteropServices;
using System.Collections.Generic;
using System.Drawing;
using System.Diagnostics;

public static class QqFgCapture {
  public const int SW_RESTORE = 9;
  public const int SW_SHOW = 5;
  public const int SW_SHOWNORMAL = 1;
  public const uint SWP_NOSIZE = 0x0001;
  public const uint SWP_NOMOVE = 0x0002;
  public const uint SWP_SHOWWINDOW = 0x0040;
  public static readonly IntPtr HWND_TOPMOST = new IntPtr(-1);
  public static readonly IntPtr HWND_NOTOPMOST = new IntPtr(-2);

  public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
  [DllImport("user32.dll")] public static extern bool BringWindowToTop(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);
  [DllImport("user32.dll", CharSet = CharSet.Unicode)] public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("kernel32.dll")] public static extern uint GetCurrentThreadId();
  [DllImport("user32.dll")] public static extern bool AttachThreadInput(uint idAttach, uint idAttachTo, bool fAttach);
  [DllImport("user32.dll")] public static extern bool AllowSetForegroundWindow(int dwProcessId);
  [DllImport("user32.dll")] public static extern bool IsWindow(IntPtr hWnd);
  [DllImport("dwmapi.dll")] public static extern int DwmGetWindowAttribute(IntPtr hwnd, int dwAttribute, out int pvAttribute, int cbAttribute);
  const int DWMWA_CLOAKED = 14;

  [StructLayout(LayoutKind.Sequential)]
  public struct RECT {
    public int Left;
    public int Top;
    public int Right;
    public int Bottom;
  }

  public class WinHit {
    public IntPtr Hwnd;
    public string Title;
    public int Area;
    public int Priority;
    public int W;
    public int H;
  }

  static bool IsCloaked(IntPtr hWnd) {
    try {
      int cloaked = 0;
      int hr = DwmGetWindowAttribute(hWnd, DWMWA_CLOAKED, out cloaked, 4);
      return hr == 0 && cloaked != 0;
    } catch { return false; }
  }

  public static List<WinHit> FindCandidateWindows() {
    List<WinHit> hits = new List<WinHit>();
    EnumWindows(delegate(IntPtr hWnd, IntPtr lParam) {
      uint pid = 0;
      GetWindowThreadProcessId(hWnd, out pid);
      string proc = "";
      try { proc = Process.GetProcessById((int)pid).ProcessName; } catch { return true; }
      bool isQqProc = string.Equals(proc, "QQ", StringComparison.OrdinalIgnoreCase)
                   || string.Equals(proc, "QQEX", StringComparison.OrdinalIgnoreCase);
      if (!isQqProc) return true;
      if (IsCloaked(hWnd)) return true;

      StringBuilder sb = new StringBuilder(512);
      GetWindowText(hWnd, sb, sb.Capacity);
      string t = sb.ToString();

      RECT r;
      if (!GetWindowRect(hWnd, out r)) return true;
      int w = r.Right - r.Left;
      int h = r.Bottom - r.Top;
      if (w < 280 || h < 200) return true;
      if (w > 4000 || h > 3000) return true;
      bool noTitle = string.IsNullOrEmpty(t);
      // skip fullscreen untitled overlays
      if (noTitle && w >= 1800 && h >= 900) return true;

      int area = Math.Max(1, w * h);
      int pri = 40;
      // login / offline Chinese via escapes
      if (t.IndexOf("\u767B\u5F55", StringComparison.Ordinal) >= 0) pri = 1;
      else if (t.IndexOf("\u4E0B\u7EBF", StringComparison.Ordinal) >= 0) pri = 2;
      else if (t.IndexOf("QQ", StringComparison.OrdinalIgnoreCase) >= 0) pri = 5;
      else if (!noTitle) pri = 10;
      else pri = 30;
      if (w >= 700 && w <= 1400 && h >= 500 && h <= 1000) pri -= 3;

      WinHit hit = new WinHit();
      hit.Hwnd = hWnd;
      hit.Title = (noTitle ? "(no-title)" : t) + " [" + proc + "] " + w + "x" + h;
      hit.Area = area;
      hit.Priority = pri;
      hit.W = w;
      hit.H = h;
      hits.Add(hit);
      return true;
    }, IntPtr.Zero);
    return hits;
  }

  public static string ForceForeground(IntPtr hWnd) {
    if (!IsWindow(hWnd)) return "dead";
    try { AllowSetForegroundWindow(-1); } catch {}
    if (IsIconic(hWnd)) ShowWindow(hWnd, SW_RESTORE);
    else ShowWindow(hWnd, SW_SHOWNORMAL);
    ShowWindow(hWnd, SW_SHOW);

    uint foreTid = 0;
    IntPtr fore = GetForegroundWindow();
    if (fore != IntPtr.Zero) {
      uint ignored;
      foreTid = GetWindowThreadProcessId(fore, out ignored);
    }
    uint curTid = GetCurrentThreadId();
    uint targetPid;
    uint targetTid = GetWindowThreadProcessId(hWnd, out targetPid);

    bool attachedFore = false;
    bool attachedTarget = false;
    if (foreTid != 0 && foreTid != curTid) {
      attachedFore = AttachThreadInput(curTid, foreTid, true);
    }
    if (targetTid != 0 && targetTid != curTid) {
      attachedTarget = AttachThreadInput(curTid, targetTid, true);
    }
    try {
      BringWindowToTop(hWnd);
      SetWindowPos(hWnd, HWND_TOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_SHOWWINDOW);
      SetForegroundWindow(hWnd);
      System.Threading.Thread.Sleep(250);
      SetWindowPos(hWnd, HWND_NOTOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_SHOWWINDOW);
      SetForegroundWindow(hWnd);
      BringWindowToTop(hWnd);
    } finally {
      if (attachedTarget) AttachThreadInput(curTid, targetTid, false);
      if (attachedFore) AttachThreadInput(curTid, foreTid, false);
    }
    System.Threading.Thread.Sleep(500);
    IntPtr now = GetForegroundWindow();
    if (now == hWnd) return "ok-foreground";
    if (IsWindowVisible(hWnd)) return "ok-visible";
    return "weak";
  }

  public static bool GetRect(IntPtr hWnd, out int left, out int top, out int w, out int h) {
    left = top = w = h = 0;
    RECT r;
    if (!GetWindowRect(hWnd, out r)) return false;
    left = r.Left; top = r.Top;
    w = r.Right - r.Left; h = r.Bottom - r.Top;
    return w >= 40 && h >= 40;
  }
}
'@

try {
  Add-Type -ReferencedAssemblies @($drawingAsm) -TypeDefinition $code -ErrorAction Stop
} catch {
  $msg = "$($_.Exception.Message)"
  if ($msg -notmatch 'already exists') { throw }
}

function Save-ScreenPng([string]$Path) {
  $b = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
  $bmp = New-Object System.Drawing.Bitmap $b.Width, $b.Height
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  try {
    $g.CopyFromScreen($b.Location, [System.Drawing.Point]::Empty, $b.Size)
    $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    return $true
  } finally {
    $g.Dispose(); $bmp.Dispose()
  }
}

function Save-WindowRegionPng([IntPtr]$Hwnd, [string]$Path) {
  $left = 0; $top = 0; $w = 0; $h = 0
  $ok = [QqFgCapture]::GetRect($Hwnd, [ref]$left, [ref]$top, [ref]$w, [ref]$h)
  if (-not $ok) { return $false }
  if ($w -gt 4000 -or $h -gt 3000) { return $false }
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  try {
    $g.CopyFromScreen($left, $top, 0, 0, (New-Object System.Drawing.Size $w, $h))
    $blank = 0; $total = 0
    $stepY = [Math]::Max(1, [int]($h / 30))
    $stepX = [Math]::Max(1, [int]($w / 30))
    for ($y = 0; $y -lt $h; $y += $stepY) {
      for ($x = 0; $x -lt $w; $x += $stepX) {
        $c = $bmp.GetPixel($x, $y)
        $total++
        $mx = [Math]::Max($c.R, [Math]::Max($c.G, $c.B))
        $mn = [Math]::Min($c.R, [Math]::Min($c.G, $c.B))
        if ($mx -lt 12 -or $mn -gt 245 -or (($mx - $mn) -lt 8 -and $c.R -gt 220)) { $blank++ }
      }
    }
    if ($total -gt 0 -and (($blank * 100) / $total) -ge 92) { return $false }
    $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    return $true
  } finally {
    $g.Dispose(); $bmp.Dispose()
  }
}

if (-not (Test-Path -LiteralPath $OutDir)) {
  New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
}

$candidates = [QqFgCapture]::FindCandidateWindows()
Write-Output ("FOUND|{0}" -f ($(if ($candidates) { $candidates.Count } else { 0 })))

if (-not $candidates -or $candidates.Count -eq 0) {
  Write-Output "NO_QQ_WINDOW"
  exit 2
}

$ordered = @($candidates | Sort-Object Priority, @{ Expression = "Area"; Descending = $true })
$best = $ordered[0]
Write-Output ("BEST|{0}|pri={1}" -f $best.Title, $best.Priority)

$fg = [QqFgCapture]::ForceForeground($best.Hwnd)
Write-Output ("FOREGROUND|{0}" -f $fg)
Start-Sleep -Milliseconds 300

$written = 0
$ts = Get-Date -Format "HHmmss"

$screenPath = Join-Path $OutDir ("{0}-01-foreground-screen-{1}.png" -f $Prefix, $ts)
if (Save-ScreenPng $screenPath) {
  Write-Output ("WROTE|{0}|FOREGROUND_SCREEN" -f $screenPath)
  $written++
}

$i = 1
foreach ($item in $ordered) {
  if ($written -ge 3) { break }
  $i++
  [void][QqFgCapture]::ForceForeground($item.Hwnd)
  Start-Sleep -Milliseconds 250
  $title = ("win{0}" -f $i)
  $path = Join-Path $OutDir ("{0}-{1:D2}-win-{2}.png" -f $Prefix, $i, $ts)
  if (Save-WindowRegionPng $item.Hwnd $path) {
    Write-Output ("WROTE|{0}|{1}" -f $path, $title)
    $written++
  } else {
    Write-Output ("SKIP|{0}" -f $title)
  }
}

if ($written -eq 0) {
  Write-Output "NO_CAPTURE"
  exit 2
}
exit 0
