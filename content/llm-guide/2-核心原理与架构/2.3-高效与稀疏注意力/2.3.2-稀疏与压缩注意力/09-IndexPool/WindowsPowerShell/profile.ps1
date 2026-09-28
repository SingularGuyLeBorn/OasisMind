
#region conda initialize
# !! Contents within this block are managed by 'conda init' !!
If (Test-Path "D:\ProgramData\miniconda3\Scripts\conda.exe") {
    (& "D:\ProgramData\miniconda3\Scripts\conda.exe" "shell.powershell" "hook") | Out-String | ?{$_} | Invoke-Expression
}
#endregion

