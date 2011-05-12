ComputerName = "." 

Dim cnt, oReg, sBaseKey, iRC, aSubKeys
Dim sKey, sValue, sTmp, sVersion, sDateValue, sYr, sMth, sDay, sUpdateKeys(0)

Const HKLM = &H80000002

sBaseKey = "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\"
TotalRAM = 0 


Set Output = CreateObject("Scripting.FileSystemObject") 
Set WshShell = Wscript.CreateObject("WScript.Shell") 
Set WMIService = GetObject ("winmgmts:" & "{impersonationLevel=impersonate}!\\" & ComputerName & "\root\cimv2") 
Set oReg = GetObject("winmgmts:{impersonationLevel=impersonate}!\\" & ComputerName & "\root\default:StdRegProv")

Set BIOSInfoList = WMIService.ExecQuery("Select * from Win32_BIOS",,48) 
Set CompSysList = WMIService.ExecQuery("Select * from Win32_ComputerSystem",,48) 
Set ProcessorList = WMIService.ExecQuery("Select * from Win32_Processor",,48) 
Set GETTIA = WMIService.ExecQuery("Select * from Win32_Environment Where Name = 'TIA'",,48) 
Set HDList = WMIService.ExecQuery("Select * from Win32_LogicalDisk Where Description = 'Local Fixed Disk'",,48) 
Set RAMList = WMIService.ExecQuery("Select * from Win32_PhysicalMemory",,48) 
Set AppList = WMIService.ExecQuery("Select * from Win32Reg_AddRemovePrograms",,48) 
Set NetList = WMIService.ExecQuery("Select * from Win32_NetworkAdapterConfiguration where IPEnabled = True",,48) 
Set dateTime = CreateObject("WbemScripting.SWbemDateTime") 
Set DVDDrives = WMIService.ExecQuery( "Select * from Win32_CDROMDrive") 

Set colChassis = WMIService.ExecQuery("Select * from Win32_SystemEnclosure") 
Set dateTime = CreateObject("WbemScripting.SWbemDateTime") 

Set allSoftware = WMIService.ExecQuery("Select * from Win32_Product") 

Set OutputFile = Output.CreateTextFile(".\" & ComputerName & ".html", true) 

On Error Resume Next


OutputFile.Writeline "<html><head>" 

OutputFile.Writeline "<style type='text/css'>" 

OutputFile.Writeline "body {font:10px arial,sans-serif;}" 
OutputFile.Writeline "h1,h2,h3 {margin-top:10px; margin-bottom:0px;}" 
OutputFile.Writeline "</style>" 
OutputFile.Writeline "</head><body>" 



OutputFile.Writeline "<h2>Computer Name: " & ComputerName & "</h2>" 
OutputFile.Writeline "Captured at " & Now & "" 
OutputFile.WriteBlankLines 1 

For Each objChassis in colChassis 
  For Each objItem in objChassis.ChassisTypes 
    sChassisType = objItem 
  Next 
Next 

select case sChassisType
  case 3 
    sChassisDesc = "Desktop" 
  case 4
    sChassisDesc = "Low Profile Desktop" 
  case 5
    sChassisDesc = "Pizza Box" 
  case 6 
    sChassisDesc = "Mini Tower" 
  case 7 
    sChassisDesc = "Tower" 
  case 8 
    sChassisDesc = "Portable" 
  case else
    sChassisDesc = "Low Profile Desktop" 
end select 

OutputFile.WriteLine 
OutputFile.WriteLine "<h3>System Identifiers</h3>" 

OutputFile.WriteLine "<table>" 
For Each BIOSInfoItem in BIOSInfoList 
  OutputFile.Writeline "<tr><td>Manufacturer : " & trim(BIOSInfoItem.Manufacturer) & "</td></tr>" 
  OutputFile.Writeline "<tr><td>BIOS Name : " & trim(BIOSInfoItem.Name) & "</td></tr>" 
  OutputFile.Writeline "<tr><td>Serial Number : " & trim(BIOSInfoItem.SerialNumber) & "</td></tr>" 
Next 
OutputFile.WriteLine "<tr><td>&nbsp</td></tr>" 

For Each CompSysItem in CompSysList 
  OutputFile.Writeline "<tr><td>Computer Model : " & trim(CompSysItem.Model) & "</td></tr>" 
  OutputFile.Writeline "<tr><td>Chassis Type : " & sChassisDesc & "</td></tr>" 
Next 

OutputFile.WriteLine "<tr><td>&nbsp</td></tr></table>" 


OutputFile.Writeline 
OutputFile.Writeline "<h3>Processors and Memory</h3>" 

OutputFile.WriteLine "<table>" 
For Each ProcessorItem in ProcessorList 
  OutputFile.Writeline "<tr><td>Processor Name : " & trim(ProcessorItem.Name) & "</td></tr>" 
Next 

For Each RAMItem in RAMList 
  TotalRAM = TotalRAM + RAMItem.Capacity 
Next 

OutputFile.WriteLine "<tr><td>RAM Capacity : " & TotalRAM/1048576 & " MB" & "</td></tr>" 

OutputFile.WriteLine "</table>" 

outputFile.Writeline 
outputFile.Writeline "<h3>Hard Drives<h3>" 


OutputFile.WriteLine "<table>" 

outputFile.Writeline "<tr><td>&nbsp</td><td>Drive</td><td>Size (GB)</td></tr>" 

For Each HDItem in HDList 
  outputFile.Writeline "<tr><td>&nbsp</td><td>" & HDItem.Name & "</td><td>" & HDItem.Size/1000000000 & "</td></tr>" 
Next 

OutputFile.WriteLine "</table>" 

outputFile.Writeline 
outputFile.Writeline "<h3>DVD Drives</h3>" 

OutputFile.WriteLine "<table>" 
outputFile.Writeline "<tr><td>&nbsp</td><td>Drive</td><td>Type</td></tr>" 


For Each objItem in DVDDrives 
  outputFile.Writeline "<tr><td>&nbsp</td><td>" & objItem.Drive & "</td><td>" & objItem.Description & "</td></tr>" 
Next 

OutputFile.WriteLine "</table>" 
outputFile.Writeline 
outputFile.Writeline "<h3>Software</h3>" 


OutputFile.WriteBlankLines 2 

outputFile.Writeline "<table>" 

  outputFile.Writeline 
  OutputFile.Writeline "<tr><td><b>&nbsp;Application&nbsp;</b></td><td><b>&nbsp;&nbsp;Version&nbsp;&nbsp;</b></td><td><b>&nbsp;&nbsp;Installed&nbsp;&nbsp;</b></td></tr>" 

  iRC = oReg.EnumKey(HKLM, sBaseKey, aSubKeys)
  aSortedKeys = qsort(aSubKeys,1, UBound(aSubKeys))

  For Each sKey In aSubKeys
    iRC = oReg.GetStringValue(HKLM, sBaseKey & sKey, "DisplayName", sValue)
    If iRC <> 0 Then
      oReg.GetStringValue HKLM, sBaseKey & sKey, "QuietDisplayName", sValue
    End If
    If sValue <> "" Then

      iRC = oReg.GetStringValue(HKLM, sBaseKey & sKey, "ReleaseType", sParent)
      If iRC <> 0 OR sParent <> "Security Update" Then
        
      
      iRC = oReg.GetStringValue(HKLM, sBaseKey & sKey, "DisplayVersion", sVersion)
      iRC = oReg.GetStringValue(HKLM, sBaseKey & sKey, "InstallDate", sDateValue)
      If sDateValue <> "" Then
        sYr =  Left(sDateValue, 4)
        sMth = Mid(sDateValue, 5, 2)
        sDay = Right(sDateValue, 2)
        'some Registry entries have improper date format
        On Error Resume Next 
        sDateValue = DateSerial(sYr, sMth, sDay)
        On Error GoTo 0
      Else
        sDataValue = "&nbsp;"
      End If

      outputFile.Writeline "<tr><td>&nbsp;" & sValue & "&nbsp;</td><td>&nbsp;" & sVersion & "&nbsp;</td><td>" & sdataValue & "</td></tr>"
      cnt = cnt + 1
     End If
    End If
  Next

OutputFile.WriteLine "</table>"
outputFile.Writeline "<h3>Security Updates</h3>" 


OutputFile.WriteBlankLines 2 
outputFile.Writeline "<table>" 
outputFile.Writeline 
OutputFile.Writeline "<tr><td><b>&nbsp;Update Name&nbsp;</b></td><td><b>&nbsp;&nbsp;Version&nbsp;&nbsp;</b></td><td><b>&nbsp;&nbsp;Installed&nbsp;&nbsp;</b></td></tr>" 

iRC = oReg.EnumKey(HKLM, sBaseKey, aSubKeys)

aSortedKeys = qsort(aSubKeys,1, UBound(aSubKeys))

For Each sKey In aSubKeys
  iRC = oReg.GetStringValue(HKLM, sBaseKey & sKey, "DisplayName", sValue)
  If iRC <> 0 Then
    oReg.GetStringValue HKLM, sBaseKey & sKey, "QuietDisplayName", sValue
  End If
  If sValue <> "" Then

    iRC = oReg.GetStringValue(HKLM, sBaseKey & sKey, "ReleaseType", sParent)
    If sParent = "Security Update" Then
        
      
      iRC = oReg.GetStringValue(HKLM, sBaseKey & sKey, "DisplayVersion", sVersion)
      iRC = oReg.GetStringValue(HKLM, sBaseKey & sKey, "InstallDate", sDateValue)
      If sDateValue <> "" Then
        sYr =  Left(sDateValue, 4)
        sMth = Mid(sDateValue, 5, 2)
        sDay = Right(sDateValue, 2)
        'some Registry entries have improper date format
        On Error Resume Next 
        sDateValue = DateSerial(sYr, sMth, sDay)
        On Error GoTo 0
      Else
        sDataValue = "&nbsp;"
      End If

      outputFile.Writeline "<tr><td>&nbsp;" & sValue & "&nbsp;</td><td>&nbsp;" & sVersion & "&nbsp;</td><td>" & sdataValue & "</td></tr>"
      cnt = cnt + 1
     End If
    End If
  Next

OutputFile.WriteLine "</table>"


Set ComputerName = Nothing 
Set WMIService = Nothing 
WScript.Quit 

'-------------------------------------
 '  quicksort
 '    Carlos Nunez, created: 25 April, 2010.
 '
 '  NOTE:   partition function also
 '          required
 '-------------------------------------
function qsort(list, first, last)
    if (typeName(list) <> "Variant()" or ubound(list) = 1) then exit function       'list passed must be a collection or array.

    'if the set size is less than 3, we can do a simple comparison sort.
    if (last-first) < 3 then
        for i = first to last
            for j = first to last
                if list(i) < list(j) then
                    swap list,i,j
                end if
            next
        next
    else
        dim p_idx

        'we need to set the pivot relative to the position of the subset currently being sorted.
        'if the starting position of the subset is the first element of the whole set, then the pivot is the median of the subset.
        'otherwise, the median is offset by the first position of the subset.
        '-------------------------------------------------------------------------------------------------------------------------
        if first-1 < 0 then
            p_idx   = round((last-first)/2,0)
        else
            p_idx   = round(((first-1)+((last-first)/2)),0)
        end if

        dim p_nidx:     p_nidx  = partition(list, first, last, p_idx)
        if p_nidx = -1 then exit function

        qsort list, first, p_nidx-1
        qsort list, p_nidx+1, last
    end if
end function


function partition(list, first, last, idx)
    partition = -1

    dim p_val:      p_val = list(idx)
    swap list,idx,last
    dim swap_pos:   swap_pos = first
    for i = first to last-1 
        if list(i) <= p_val then
            swap list,i,swap_pos
            swap_pos = swap_pos + 1
        end if
    next
    swap list,swap_pos,last

    partition = swap_pos
end function

function swap(list,a_pos,b_pos)
    dim tmp
    tmp = list(a_pos)
    list(a_pos) = list(b_pos)
    list(b_pos) = tmp   
end function
