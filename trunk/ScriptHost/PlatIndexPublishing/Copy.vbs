' $Workfile: Copy.vbs $ 
' $Revision: 3 $ 
' $Author: Weis $ 
' $Date: 8/16/06 11:46a $ 
'
'==========================================================================
' Purpose: copy new blank dbfs from shells
'==========================================================================

set Parms = WScript.Arguments.Named
if NOT Parms.Exists("source") then
  WScript.Arguments.ShowUsage
  WScript.Quit
end if

location = WScript.Arguments.Named.Item("source")
Wscript.StdOut.Write "Copying files..."


dim fso
set fso = CreateObject("Scripting.FileSystemObject")
summarysrcfile = "x:\amls\pubamls\pubtools\pubmapbook\_SUMORTH.DBF"
sortsrcfile = "x:\amls\pubamls\pubtools\pubmapbook\_SORTORTH.DBF"
codesrcfile = "x:\amls\pubamls\pubtools\pubmapbook\citycode.dbf"
roadsrcfile = "x:\amls\pubamls\pubtools\pubmapbook\roadOrth.dbf"

summarydestfile = WScript.Arguments.Named.Item("source") & "\SUMORTH.DBF"
sortdestfile = WScript.Arguments.Named.Item("source") & "\SORTORTH.DBF"
codedestfile = WScript.Arguments.Named.Item("source") & "\citycode.dbf"
roaddestfile = WScript.Arguments.Named.Item("source") & "\roadOrth.dbf"

fso.CopyFile summarysrcfile,summarydestfile,True
fso.CopyFile sortsrcfile, sortdestfile, True
fso.CopyFile roadsrcfile,roaddestfile,True
fso.CopyFile codesrcfile, codedestfile, True
set fso = Nothing
WScript.StdOut.Write "Done"
Wscript.Echo 