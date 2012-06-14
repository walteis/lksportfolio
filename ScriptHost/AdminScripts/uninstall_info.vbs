Const HKLM = &H80000002

strComputer = "."

Set oReg = GetObject("winmgmts:{impersonationLevel=impersonate}" _
& "!\\" & strComputer & "\root\default:StdRegProv")

sPath = "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall"
oReg.EnumKey HKLM, sPath, aKeys

For Each sKey in aKeys
oReg.GetStringValue HKLM, sPath & "\" & sKey, "DisplayName", sName
If Not IsNull(sName) Then sList = sList & sName & vbCr
Next

WScript.Echo sList