$target = "D:\ALL IN AI\OasisMind"
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
using System.Text;
public static class ProcDir {
  [DllImport("kernel32.dll")] public static extern IntPtr OpenProcess(uint access, bool inherit, int pid);
  [DllImport("kernel32.dll")] public static extern bool CloseHandle(IntPtr h);
  [DllImport("ntdll.dll")] public static extern int NtQueryInformationProcess(IntPtr h, int cls, ref PROCESS_BASIC_INFORMATION info, int len, out int ret);
  [DllImport("kernel32.dll")] public static extern bool ReadProcessMemory(IntPtr h, IntPtr addr, byte[] buf, int size, out int read);
  [StructLayout(LayoutKind.Sequential)] public struct PROCESS_BASIC_INFORMATION {
    public IntPtr Reserved1, PebBaseAddress, Reserved2_0, Reserved2_1;
    public IntPtr UniqueProcessId, Reserved3;
  }
}
"@
$hits = @()
Get-Process | ForEach-Object {
  $h = [ProcDir]::OpenProcess(0x0410, $false, $_.Id)
  if ($h -eq [IntPtr]::Zero) { return }
  try {
    $pbi = New-Object ProcDir+PROCESS_BASIC_INFORMATION
    $ret = 0
    if ([ProcDir]::NtQueryInformationProcess($h, 0, [ref]$pbi, [Runtime.InteropServices.Marshal]::SizeOf($pbi), [ref]$ret) -ne 0) { return }
    $peb = New-Object byte[] 64
    $n = 0
    if (-not [ProcDir]::ReadProcessMemory($h, $pbi.PebBaseAddress, $peb, 64, [ref]$n)) { return }
    $params = [Runtime.InteropServices.Marshal]::ReadIntPtr($peb, 0x20)
    $cwdBuf = New-Object byte[] 16
    if (-not [ProcDir]::ReadProcessMemory($h, [IntPtr]($params.ToInt64() + 0x38), $cwdBuf, 16, [ref]$n)) { return }
    $len = [BitConverter]::ToUInt16($cwdBuf, 0)
    $ptr = [Runtime.InteropServices.Marshal]::ReadIntPtr($cwdBuf, 8)
    if ($len -lt 2 -or $len -gt 1024) { return }
    $raw = New-Object byte[] $len
    if (-not [ProcDir]::ReadProcessMemory($h, $ptr, $raw, $len, [ref]$n)) { return }
    $cwd = [Text.Encoding]::Unicode.GetString($raw).TrimEnd([char]0)
    if ($cwd -like "$target*") { $hits += "$($_.Id) $($_.ProcessName) $cwd" }
  } finally { [ProcDir]::CloseHandle($h) | Out-Null }
}
if ($hits.Count -eq 0) { "NONE" } else { $hits }
