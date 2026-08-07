# EXPERIMENTAL / NOT the mature path.
# QQNT login window: almost no UI Automation tree; coord clicks are unreliable.
# Prefer NapCat WebUI PasswordLogin (scripts/start-napcat.mjs). Enable via ONEBOT_QQ_NATIVE_UI=true.
# Env: ONEBOT_QQ_ACCOUNT / ONEBOT_QQ_PASSWORD (optional; empty = switch only)
# Exit: 0 ok, 2 no window, 1 error

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
Add-Type -AssemblyName System.Windows.Forms

Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class QqNativeUi {
  [StructLayout(LayoutKind.Sequential)]
  public struct RECT { public int Left; public int Top; public int Right; public int Bottom; }
  [StructLayout(LayoutKind.Sequential)]
  public struct POINT { public int X; public int Y; }
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int X, int Y);
  [DllImport("user32.dll")] public static extern void mouse_event(int dwFlags, int dx, int dy, int cButtons, int dwExtraInfo);
  [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);
  [DllImport("kernel32.dll")] public static extern uint GetCurrentThreadId();
  [DllImport("user32.dll")] public static extern bool AttachThreadInput(uint idAttach, uint idAttachTo, bool fAttach);
  [DllImport("user32.dll")] public static extern bool BringWindowToTop(IntPtr hWnd);
  public const int MOUSEEVENTF_LEFTDOWN = 0x02;
  public const int MOUSEEVENTF_LEFTUP = 0x04;
  public static void EnsureDpiAware() { try { SetProcessDPIAware(); } catch { } }
  public static void ForceForeground(IntPtr hWnd) {
    ShowWindow(hWnd, 9);
    ShowWindow(hWnd, 5);
    uint pid;
    uint foreTid = GetWindowThreadProcessId(GetForegroundWindow(), out pid);
    uint selfTid = GetCurrentThreadId();
    if (foreTid != selfTid) AttachThreadInput(selfTid, foreTid, true);
    BringWindowToTop(hWnd);
    SetForegroundWindow(hWnd);
    if (foreTid != selfTid) AttachThreadInput(selfTid, foreTid, false);
  }
  public static void Click(int x, int y) {
    SetCursorPos(x, y);
    System.Threading.Thread.Sleep(50);
    mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0);
    System.Threading.Thread.Sleep(50);
    mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0);
  }
  public static bool TryGetRect(IntPtr hWnd, out int left, out int top, out int width, out int height) {
    left = 0; top = 0; width = 0; height = 0;
    RECT rect;
    if (!GetWindowRect(hWnd, out rect)) return false;
    left = rect.Left;
    top = rect.Top;
    width = rect.Right - rect.Left;
    height = rect.Bottom - rect.Top;
    return true;
  }
}
"@

[QqNativeUi]::EnsureDpiAware() | Out-Null

function Send-KeysSafe([string]$text) {
  if ([string]::IsNullOrEmpty($text)) { return }
  $escaped = [regex]::Replace($text, '([+\^%~(){}\[\]])', '{$1}')
  [System.Windows.Forms.SendKeys]::SendWait($escaped)
}

function Find-QqLoginWindow {
  $root = [System.Windows.Automation.AutomationElement]::RootElement
  $all = $root.FindAll(
    [System.Windows.Automation.TreeScope]::Children,
    [System.Windows.Automation.Condition]::TrueCondition
  )
  $candidates = @()
  foreach ($el in $all) {
    if ($el.Current.Name -ne "QQ") { continue }
    if ($el.Current.ClassName -ne "Chrome_WidgetWin_1") { continue }
    $hwnd = [IntPtr]$el.Current.NativeWindowHandle
    if ($hwnd -eq [IntPtr]::Zero) { continue }
    if ([QqNativeUi]::IsIconic($hwnd)) {
      [void][QqNativeUi]::ShowWindow($hwnd, 9)
      Start-Sleep -Milliseconds 400
    }
    $l = 0; $t = 0; $w = 0; $h = 0
    if (-not [QqNativeUi]::TryGetRect($hwnd, [ref]$l, [ref]$t, [ref]$w, [ref]$h)) { continue }
    $candidates += [pscustomobject]@{ Hwnd = $hwnd; Left = $l; Top = $t; Width = $w; Height = $h }
  }

  $best = $null
  $bestArea = [int]::MaxValue
  foreach ($c in $candidates) {
    if ($c.Width -lt 260 -or $c.Width -gt 520 -or $c.Height -lt 360 -or $c.Height -gt 720) { continue }
    $area = $c.Width * $c.Height
    if ($area -lt $bestArea) { $bestArea = $area; $best = $c }
  }
  return $best
}

$account = ""
$password = ""
if ($env:ONEBOT_QQ_ACCOUNT) { $account = $env:ONEBOT_QQ_ACCOUNT.Trim() }
if ($env:ONEBOT_QQ_PASSWORD) { $password = $env:ONEBOT_QQ_PASSWORD.Trim() }
if (-not $password -and $env:NAPCAT_QUICK_PASSWORD) { $password = $env:NAPCAT_QUICK_PASSWORD.Trim() }
# QQ_SWITCH_ONLY=1 → never fill, even if env has password
$switchOnly = ($env:QQ_SWITCH_ONLY -eq "1") -or ($env:QQ_SWITCH_ONLY -eq "true")

$win = Find-QqLoginWindow
if (-not $win) {
  Write-Output "NO_QQ_LOGIN_WINDOW"
  exit 2
}

$hwnd = $win.Hwnd
$left = [int]$win.Left
$top = [int]$win.Top
$winW = [int]$win.Width
$winH = [int]$win.Height
Write-Output ("FOUND_QQ_LOGIN L={0} T={1} W={2} H={3}" -f $left, $top, $winW, $winH)

[QqNativeUi]::ForceForeground($hwnd)
Start-Sleep -Milliseconds 400

# 扫码页左下「账号登录」：相对坐标多点连点（旧版文案可能是「账密登录」）
# 实测 0.18/0.905 偏左偏下会点空；覆盖卡片底栏左链区域
$targets = @(
  @(0.25, 0.875),
  @(0.28, 0.885),
  @(0.22, 0.870),
  @(0.30, 0.890),
  @(0.26, 0.900)
)

foreach ($pair in $targets) {
  $rx = [double]$pair[0]
  $ry = [double]$pair[1]
  $l = 0; $t = 0; $w = 0; $h = 0
  if (-not [QqNativeUi]::TryGetRect($hwnd, [ref]$l, [ref]$t, [ref]$w, [ref]$h)) { continue }
  $cx = [int]($l + $w * $rx)
  $cy = [int]($t + $h * $ry)
  Write-Output ("CLICK_ACCOUNT_LOGIN x={0} y={1} rel={2},{3}" -f $cx, $cy, $rx, $ry)
  [QqNativeUi]::ForceForeground($hwnd)
  Start-Sleep -Milliseconds 120
  [QqNativeUi]::Click($cx, $cy)
  Start-Sleep -Milliseconds 450
}

Start-Sleep -Milliseconds 600
$left2 = 0; $top2 = 0; $winW2 = 0; $winH2 = 0
if ([QqNativeUi]::TryGetRect($hwnd, [ref]$left2, [ref]$top2, [ref]$winW2, [ref]$winH2)) {
  $left = $left2; $top = $top2; $winW = $winW2; $winH = $winH2
}
Write-Output ("AFTER_SWITCH L={0} T={1} W={2} H={3}" -f $left, $top, $winW, $winH)

if ($switchOnly -or -not $account -or -not $password) {
  Write-Output "SWITCHED_NO_FILL"
  exit 0
}

[QqNativeUi]::ForceForeground($hwnd)
Start-Sleep -Milliseconds 250

$ptFieldX = [int]($left + $winW * 0.50)
$ptAccountY = [int]($top + $winH * 0.38)
$ptPasswordY = [int]($top + $winH * 0.50)
$ptLoginY = [int]($top + $winH * 0.64)

Write-Output ("FILL_ACCOUNT at {0},{1}" -f $ptFieldX, $ptAccountY)
[QqNativeUi]::Click($ptFieldX, $ptAccountY)
Start-Sleep -Milliseconds 250
[System.Windows.Forms.SendKeys]::SendWait("^a{BACKSPACE}")
Start-Sleep -Milliseconds 80
Send-KeysSafe $account
Start-Sleep -Milliseconds 250

Write-Output ("FILL_PASSWORD at {0},{1}" -f $ptFieldX, $ptPasswordY)
[QqNativeUi]::Click($ptFieldX, $ptPasswordY)
Start-Sleep -Milliseconds 250
[System.Windows.Forms.SendKeys]::SendWait("^a{BACKSPACE}")
Start-Sleep -Milliseconds 80
Send-KeysSafe $password
Start-Sleep -Milliseconds 250

Write-Output ("CLICK_LOGIN at {0},{1}" -f $ptFieldX, $ptLoginY)
[QqNativeUi]::Click($ptFieldX, $ptLoginY)
Start-Sleep -Milliseconds 400

Write-Output "SUBMITTED"
exit 0
