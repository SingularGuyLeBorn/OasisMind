# Dismiss QQNT "offline / login expired" modal (click 确定).
# QQNT often keeps top-level title as "QQ" — title-only match misses the dialog.
# Strategy: UI Automation Button「确定」under QQ; optional Enter on login-sized hwnd.
# Args: -AllowEnterFallback  (recover paths; periodic watchdog should omit this)
# Exit: 0 clicked/sent, 2 no dialog, 1 error

param(
  [switch]$AllowEnterFallback
)

$ErrorActionPreference = "Continue"
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
Add-Type -AssemblyName System.Windows.Forms

Add-Type @"
using System;
using System.Text;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Collections.Generic;

public static class QqOfflineUi {
  public const int SW_RESTORE = 9;
  public const int SW_SHOW = 5;
  public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);
  [DllImport("user32.dll", CharSet = CharSet.Unicode)] public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);
  [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr hWnd);

  [StructLayout(LayoutKind.Sequential)]
  public struct RECT { public int Left, Top, Right, Bottom; }

  public class Hit {
    public IntPtr Hwnd;
    public string Title;
    public int W, H;
    public int Priority;
    public bool LoginSized;
  }

  public static bool IsLoginSized(int w, int h) {
    return w >= 420 && w <= 1100 && h >= 360 && h <= 980;
  }

  public static List<Hit> FindQqWindows() {
    var hits = new List<Hit>();
    EnumWindows((hWnd, lParam) => {
      if (!IsWindowVisible(hWnd)) return true;
      uint pid = 0;
      GetWindowThreadProcessId(hWnd, out pid);
      string proc = "";
      try { proc = Process.GetProcessById((int)pid).ProcessName; } catch { return true; }
      if (!string.Equals(proc, "QQ", StringComparison.OrdinalIgnoreCase)
          && !string.Equals(proc, "QQEX", StringComparison.OrdinalIgnoreCase)) return true;
      RECT r;
      if (!GetWindowRect(hWnd, out r)) return true;
      int w = r.Right - r.Left, h = r.Bottom - r.Top;
      if (w < 200 || h < 160) return true;
      var sb = new StringBuilder(512);
      GetWindowText(hWnd, sb, sb.Capacity);
      string t = sb.ToString() ?? "";
      bool loginSized = IsLoginSized(w, h);
      int pri = 50;
      if (t.IndexOf("\u4E0B\u7EBF", StringComparison.Ordinal) >= 0) pri = 1;
      else if (t.IndexOf("\u767B\u5F55", StringComparison.Ordinal) >= 0) pri = 2;
      else if (loginSized) pri = 8;
      else if (t.Equals("QQ", StringComparison.OrdinalIgnoreCase)) pri = 40;
      hits.Add(new Hit { Hwnd = hWnd, Title = t, W = w, H = h, Priority = pri, LoginSized = loginSized });
      return true;
    }, IntPtr.Zero);
    hits.Sort((a, b) => a.Priority.CompareTo(b.Priority));
    return hits;
  }

  public static void SoftFocus(IntPtr hWnd) {
    if (IsIconic(hWnd)) ShowWindow(hWnd, SW_RESTORE);
    else ShowWindow(hWnd, SW_SHOW);
    SetForegroundWindow(hWnd);
  }
}
"@

$btnName = [string]([char]0x786E + [char]0x5B9A) # 确定
$offline = [string]([char]0x4E0B + [char]0x7EBF + [char]0x901A + [char]0x77E5) # 下线通知
$expired = [string]([char]0x767B + [char]0x5F55 + [char]0x5DF2 + [char]0x5931 + [char]0x6548) # 登录已失效
$offlineShort = [string]([char]0x4E0B + [char]0x7EBF) # 下线

function Find-OfflineConfirmButton {
  $desktop = [System.Windows.Automation.AutomationElement]::RootElement
  $qqPids = @()
  try {
    $qqPids = @(Get-Process -Name QQ, QQEX -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Id)
  } catch {}
  if (-not $qqPids -or $qqPids.Count -eq 0) { return $null }

  $walker = [System.Windows.Automation.TreeWalker]::ControlViewWalker
  foreach ($procId in $qqPids) {
    $condPid = New-Object System.Windows.Automation.PropertyCondition(
      [System.Windows.Automation.AutomationElement]::ProcessIdProperty, [int]$procId)
    $roots = @($desktop.FindAll([System.Windows.Automation.TreeScope]::Children, $condPid))
    foreach ($root in $roots) {
      if (-not $root) { continue }
      $treeHasOffline = $false
      try {
        $name = [string]$root.Current.Name
        if ($name -and ($name.Contains($offline) -or $name.Contains($expired) -or $name.Contains($offlineShort))) {
          $treeHasOffline = $true
        }
      } catch {}

      # Any descendant text containing offline markers
      if (-not $treeHasOffline) {
        try {
          $textCond = New-Object System.Windows.Automation.PropertyCondition(
            [System.Windows.Automation.AutomationElement]::ControlTypeProperty,
            [System.Windows.Automation.ControlType]::Text)
          $texts = @($root.FindAll([System.Windows.Automation.TreeScope]::Descendants, $textCond))
          foreach ($tx in $texts) {
            $n = [string]$tx.Current.Name
            if ($n -and ($n.Contains($offline) -or $n.Contains($expired) -or $n.Contains($offlineShort))) {
              $treeHasOffline = $true
              break
            }
          }
        } catch {}
      }

      $btnCond = New-Object System.Windows.Automation.AndCondition(
        (New-Object System.Windows.Automation.PropertyCondition(
          [System.Windows.Automation.AutomationElement]::ControlTypeProperty,
          [System.Windows.Automation.ControlType]::Button)),
        (New-Object System.Windows.Automation.PropertyCondition(
          [System.Windows.Automation.AutomationElement]::NameProperty, $btnName))
      )
      $buttons = @($root.FindAll([System.Windows.Automation.TreeScope]::Descendants, $btnCond))
      $rect = $root.Current.BoundingRectangle
      $dialogLike = ($rect.Width -ge 360 -and $rect.Width -le 1200 -and $rect.Height -ge 280 -and $rect.Height -le 1000)

      foreach ($btn in $buttons) {
        if (-not $btn) { continue }
        if ($treeHasOffline -or $dialogLike) {
          return @{ Element = $btn; Offline = $treeHasOffline; DialogLike = $dialogLike }
        }
      }
    }
  }
  return $null
}

$found = Find-OfflineConfirmButton
if ($found -and $found.Element) {
  try {
    $pat = $found.Element.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern)
    if ($pat) {
      $pat.Invoke()
      Write-Output "CLICKED_UIA_CONFIRM"
      exit 0
    }
  } catch {}
  try { $found.Element.SetFocus() } catch {}
}

if (-not $AllowEnterFallback) {
  Write-Output "NO_OFFLINE_DIALOG"
  exit 2
}

$hits = [QqOfflineUi]::FindQqWindows()
$loginHits = @($hits | Where-Object { $_.LoginSized -or $_.Priority -le 8 })
if (-not $loginHits -or $loginHits.Count -eq 0) {
  Write-Output "NO_OFFLINE_DIALOG"
  exit 2
}

$hwnd = $loginHits[0].Hwnd
[QqOfflineUi]::SoftFocus($hwnd)
Start-Sleep -Milliseconds 280
[System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
Start-Sleep -Milliseconds 120
[System.Windows.Forms.SendKeys]::SendWait(" ")
Write-Output ("SENT_ENTER_TO_LOGIN_WINDOW|title={0}|{1}x{2}" -f $loginHits[0].Title, $loginHits[0].W, $loginHits[0].H)
exit 0
