# Dismiss QQNT offline modal. Chinese matched via Unicode escapes (file encoding safe).
# Exit: 0 clicked/sent, 2 no dialog, 1 error

$ErrorActionPreference = "Continue"
Add-Type -AssemblyName System.Windows.Forms

Add-Type @"
using System;
using System.Text;
using System.Runtime.InteropServices;
using System.Collections.Generic;
public static class QqOfflineUi {
  public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);
  [DllImport("user32.dll", CharSet = CharSet.Unicode)] public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hWnd);
  public static List<IntPtr> FindByTitleContains(string[] needles) {
    var hits = new List<IntPtr>();
    EnumWindows((hWnd, lParam) => {
      if (!IsWindowVisible(hWnd)) return true;
      var sb = new StringBuilder(512);
      GetWindowText(hWnd, sb, sb.Capacity);
      var t = sb.ToString();
      if (string.IsNullOrEmpty(t)) return true;
      foreach (var n in needles) {
        if (t.IndexOf(n, StringComparison.Ordinal) >= 0) { hits.Add(hWnd); break; }
      }
      return true;
    }, IntPtr.Zero);
    return hits;
  }
}
"@

# 下线通知 / 登录已失效 / 重新登录
$needles = @(
  [string]([char]0x4E0B + [char]0x7EBF + [char]0x901A + [char]0x77E5),
  [string]([char]0x767B + [char]0x5F55 + [char]0x5DF2 + [char]0x5931 + [char]0x6548),
  [string]([char]0x91CD + [char]0x65B0 + [char]0x767B + [char]0x5F55)
)

$hits = [QqOfflineUi]::FindByTitleContains($needles)
if (-not $hits -or $hits.Count -eq 0) {
  Write-Output "NO_OFFLINE_DIALOG"
  exit 2
}

$hwnd = $hits[0]
[void][QqOfflineUi]::ShowWindow($hwnd, 9)
[void][QqOfflineUi]::SetForegroundWindow($hwnd)
Start-Sleep -Milliseconds 250
[System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
Start-Sleep -Milliseconds 120
[System.Windows.Forms.SendKeys]::SendWait(" ")
Write-Output "SENT_ENTER_TO_OFFLINE_DIALOG"
exit 0
