# Soft capture QQ for mail attachments.
# NEVER AttachThreadInput / HWND_TOPMOST — those deadlock QQ NT UI thread.
# Prefer login-sized QQ hwnd + PrintWindow; fall back to CopyFromScreen region then desktop.
# Args: -OutDir <dir> [-Prefix qq]
# Exit: 0 wrote png, 2 no window, 1 error

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
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Imaging;

public static class QqSoftCapture {
  public const int SW_RESTORE = 9;
  public const int SW_SHOWNOACTIVATE = 4;
  public const uint PW_RENDERFULLCONTENT = 0x00000002;

  public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);
  [DllImport("user32.dll", CharSet = CharSet.Unicode)] public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);
  [DllImport("user32.dll")] public static extern bool IsWindow(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr hwnd, IntPtr hdcBlt, uint nFlags);
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
    public bool Visible;
    public bool Minimized;
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
      bool isQq = string.Equals(proc, "QQ", StringComparison.OrdinalIgnoreCase)
               || string.Equals(proc, "QQEX", StringComparison.OrdinalIgnoreCase);
      if (!isQq) return true;
      if (IsCloaked(hWnd)) return true;

      StringBuilder sb = new StringBuilder(512);
      GetWindowText(hWnd, sb, sb.Capacity);
      string t = sb.ToString();

      RECT r;
      if (!GetWindowRect(hWnd, out r)) return true;
      int w = r.Right - r.Left;
      int h = r.Bottom - r.Top;
      if (w < 240 || h < 180 || w > 4000 || h > 3000) return true;
      bool noTitle = string.IsNullOrEmpty(t);
      // Skip huge blank/shell hosts
      if (noTitle && w >= 1600 && h >= 900) return true;

      int pri = 40;
      if (t.IndexOf("\u4E0B\u7EBF", StringComparison.Ordinal) >= 0) pri = 1; // 下线
      else if (t.IndexOf("\u767B\u5F55", StringComparison.Ordinal) >= 0) pri = 2; // 登录
      else if (t.Equals("QQ", StringComparison.OrdinalIgnoreCase)) pri = 6;
      else if (t.IndexOf("QQ", StringComparison.OrdinalIgnoreCase) >= 0) pri = 8;
      else if (!noTitle) pri = 15;
      else pri = 30;

      // Login / offline dialog frame: mid-size, portrait-ish
      if (w >= 420 && w <= 1100 && h >= 360 && h <= 980) pri -= 8;
      if (IsWindowVisible(hWnd) && !IsIconic(hWnd)) pri -= 2;
      if (IsIconic(hWnd)) pri += 20;

      WinHit hit = new WinHit();
      hit.Hwnd = hWnd;
      hit.Title = (noTitle ? "(no-title)" : t) + " [" + proc + "] " + w + "x" + h;
      hit.Area = w * h;
      hit.Priority = pri;
      hit.W = w;
      hit.H = h;
      hit.Visible = IsWindowVisible(hWnd);
      hit.Minimized = IsIconic(hWnd);
      hits.Add(hit);
      return true;
    }, IntPtr.Zero);
    return hits;
  }

  public static string SoftShow(IntPtr hWnd) {
    if (!IsWindow(hWnd)) return "dead";
    if (IsIconic(hWnd)) {
      ShowWindow(hWnd, SW_RESTORE);
      System.Threading.Thread.Sleep(280);
      try { SetForegroundWindow(hWnd); } catch {}
      return "restored";
    }
    ShowWindow(hWnd, SW_SHOWNOACTIVATE);
    try { SetForegroundWindow(hWnd); } catch {}
    System.Threading.Thread.Sleep(120);
    return "ok";
  }

  public static bool GetRect(IntPtr hWnd, out int left, out int top, out int w, out int h) {
    left = top = w = h = 0;
    RECT r;
    if (!GetWindowRect(hWnd, out r)) return false;
    left = r.Left; top = r.Top;
    w = r.Right - r.Left; h = r.Bottom - r.Top;
    return w >= 40 && h >= 40;
  }

  /** PrintWindow — works when window is on another virtual desktop / partially occluded */
  public static bool SavePrintWindow(IntPtr hWnd, string path) {
    int left, top, w, h;
    if (!GetRect(hWnd, out left, out top, out w, out h)) return false;
    if (w > 4000 || h > 3000) return false;
    using (Bitmap bmp = new Bitmap(w, h, PixelFormat.Format32bppArgb)) {
      using (Graphics g = Graphics.FromImage(bmp)) {
        IntPtr hdc = g.GetHdc();
        try {
          bool ok = PrintWindow(hWnd, hdc, PW_RENDERFULLCONTENT);
          if (!ok) ok = PrintWindow(hWnd, hdc, 0);
          if (!ok) return false;
        } finally {
          g.ReleaseHdc(hdc);
        }
      }
      // Reject near-black / empty captures
      try {
        Color c = bmp.GetPixel(Math.Min(20, w - 1), Math.Min(20, h - 1));
        Color c2 = bmp.GetPixel(w / 2, h / 2);
        if (c.A < 10 && c2.A < 10) return false;
      } catch {}
      bmp.Save(path, ImageFormat.Png);
      return true;
    }
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
  if (-not [QqSoftCapture]::GetRect($Hwnd, [ref]$left, [ref]$top, [ref]$w, [ref]$h)) { return $false }
  if ($w -gt 4000 -or $h -gt 3000) { return $false }
  if ($left -lt -20000 -or $top -lt -20000) { return $false }
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  try {
    $g.CopyFromScreen($left, $top, 0, 0, (New-Object System.Drawing.Size $w, $h))
    $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    return $true
  } catch {
    return $false
  } finally {
    $g.Dispose(); $bmp.Dispose()
  }
}

if (-not (Test-Path -LiteralPath $OutDir)) {
  New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
}

$candidates = [QqSoftCapture]::FindCandidateWindows()
Write-Output ("FOUND|{0}" -f ($(if ($candidates) { $candidates.Count } else { 0 })))

$ts = Get-Date -Format "HHmmss"
$written = 0

if (-not $candidates -or $candidates.Count -eq 0) {
  $screenPath = Join-Path $OutDir ("{0}-01-screen-{1}.png" -f $Prefix, $ts)
  if (Save-ScreenPng $screenPath) {
    Write-Output ("WROTE|{0}|SCREEN_ONLY" -f $screenPath)
    exit 0
  }
  Write-Output "NO_QQ_WINDOW"
  exit 2
}

$ordered = @($candidates | Sort-Object Priority, @{ Expression = "Area"; Descending = $false })
$best = $ordered[0]
Write-Output ("BEST|{0}|pri={1}" -f $best.Title, $best.Priority)

$soft = [QqSoftCapture]::SoftShow($best.Hwnd)
Write-Output ("SOFTSHOW|{0}" -f $soft)
Start-Sleep -Milliseconds 350

# 1) PrintWindow of QQ hwnd first (ground truth of that window)
$pwPath = Join-Path $OutDir ("{0}-01-qq-{1}.png" -f $Prefix, $ts)
if ([QqSoftCapture]::SavePrintWindow($best.Hwnd, $pwPath)) {
  Write-Output ("WROTE|{0}|PRINTWINDOW" -f $pwPath)
  $written++
}

# 2) Window-region CopyFromScreen (may miss virtual desktop / wrong monitor)
$winPath = Join-Path $OutDir ("{0}-02-win-{1}.png" -f $Prefix, $ts)
if (Save-WindowRegionPng $best.Hwnd $winPath) {
  Write-Output ("WROTE|{0}|WIN" -f $winPath)
  $written++
}

# 3) Primary screen only if QQ capture failed
if ($written -eq 0) {
  $screenPath = Join-Path $OutDir ("{0}-03-screen-{1}.png" -f $Prefix, $ts)
  if (Save-ScreenPng $screenPath) {
    Write-Output ("WROTE|{0}|SCREEN_FALLBACK" -f $screenPath)
    $written++
  }
}

if ($written -eq 0) {
  Write-Output "NO_CAPTURE"
  exit 2
}
exit 0
