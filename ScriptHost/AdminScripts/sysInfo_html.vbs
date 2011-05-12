ComputerName = "."

Set Output = CreateObject("Scripting.FileSystemObject")
Set WshShell = Wscript.CreateObject("WScript.Shell")
Set WMIService = GetObject ("winmgmts:\\" & ComputerName & "\root\cimv2")
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

Set colSoftware = WMIService.ExecQuery("Select * from Win32_Product where Vendor <> 'Environmental Systems Research Institute, Inc.' and Vendor <>  'Microsoft Corporation' and Vendor <> 'Microsoft' and Vendor <> 'Environmental System Research Institute, Inc.'")

Set esriSoftware = WMIService.ExecQuery ("Select * from Win32_Product where Vendor = 'Environmental Systems Research Institute, Inc.' or Vendor = 'Environmental System Research Institute, Inc.'")

Set msSoftware = WMIService.ExecQuery("Select * from Win32_Product where Vendor = 'Microsoft Corporation' or Vendor = 'Microsoft'")

TotalRAM = 0

Set OutputFile = Output.CreateTextFile("C:\Temp\" & ComputerName & ".html", true)


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
        sChassisType =  objItem
    Next
Next

if sChassisType = 3 then
    sChassisDesc = "Desktop"
elseif sChassisType = 4 then
    sChassisDesc = "Low Profile Desktop"
elseif sChassisType = 5 then
    sChassisDesc = "Pizza Box"
elseif sChassisType = 6 then
    sChassisDesc = "Mini Tower"
elseif sChassisType = 7 then
    sChassisDesc = "Tower"
elseif sChassisType = 8 then
    sChassisDesc = "Portable"
else
    sChassisDesc = "Low Profile Desktop"
end if

OutputFile.WriteLine
OutputFile.WriteLine "<h3>System Identifiers</h3>"

OutputFile.WriteLine "<table>"
For Each BIOSInfoItem in BIOSInfoList
	OutputFile.Writeline "<tr><td>Manufacturer          : " & trim(BIOSInfoItem.Manufacturer) & "</td></tr>"
	OutputFile.Writeline "<tr><td>BIOS Name             : " & trim(BIOSInfoItem.Name) & "</td></tr>"
	OutputFile.Writeline "<tr><td>Serial Number         : " & trim(BIOSInfoItem.SerialNumber) & "</td></tr>"
Next
OutputFile.WriteLine "<tr><td>&nbsp</td></tr>"

For Each CompSysItem in CompSysList
	OutputFile.Writeline "<tr><td>Computer Model        : " & trim(CompSysItem.Model) & "</td></tr>" 
	OutputFile.Writeline "<tr><td>Chassis Type          : " & sChassisDesc & "</td></tr>"
Next

OutputFile.WriteLine "<tr><td>&nbsp</td></tr></table>"


OutputFile.Writeline
OutputFile.Writeline "<h3>Processors and Memory</h3>"

OutputFile.WriteLine "<table>"
For Each ProcessorItem in ProcessorList
	OutputFile.Writeline "<tr><td>Processor Name        : " & trim(ProcessorItem.Name) & "</td></tr>"
Next

For Each RAMItem in RAMList
	TotalRAM = TotalRAM + RAMItem.Capacity
Next

OutputFile.WriteLine "<tr><td>RAM Capacity          : " & TotalRAM/1048576 & " MB" & "</td></tr>"

OutputFile.WriteLine "</table>"

outputFile.Writeline
outputFile.Writeline "<h3>Hard Drives<h3>"


OutputFile.WriteLine "<table>"

outputFile.Writeline   "<tr><td>&nbsp</td><td>Drive</td><td>Size (GB)</td></tr>"

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

OutputFile.WriteBlankLines 2

outputFile.Writeline "<table>"
OutputFile.Writeline "<tr><td><h3>ESRI Applications</h3></td><td><b>Version</b></td><td><b>Installed</b></td></tr>" 

For Each objSoftware In esriSoftware
    sAppName = objSoftware.Name
    sVersion = objSoftware.Version
    InstallDate = Left(CStr(objSoftware.InstallDate2), 4) & "-" & Mid(CStr(objSoftware.InstallDate2), 5, 2) & "-" & _
        Mid(CStr(objSoftware.InstallDate2), 7, 2)
    OutputFile.Writeline "<tr><td>" & sAppName & "</td><td>" & sVersion & "</td><td>" & InstallDate & "</td></tr>"
Next

outputFile.Writeline
OutputFile.Writeline "<tr><td><h3>Microsoft Applications</h3></td><td><b>Version</b></td><td><b>Installed</b></td></tr>" 

For Each objSoftware in msSoftware
    dateTime.Value = objSoftware.InstallDate2
    outputFile.Writeline "<tr><td>" & objSoftware.Name & "</td><td>" & objSoftware.Version & "</td><td>" & formatDateTime(dateTime.GetVarDate,vbShortDate) & "</td></tr>"
Next

outputFile.Writeline
OutputFile.Writeline "<tr><td><h3>Other Applications</h3></td><td><b>Version</b></td><td><b>Installed</b></td></tr>" 

For Each objSoftware in colSoftware
    dateTime.Value = objSoftware.InstallDate2
    outputFile.Writeline "<tr><td>" & objSoftware.Name & "</td><td>" & objSoftware.Version & "</td><td>" & formatDateTime(dateTime.GetVarDate,vbShortDate) & "</td></tr>"
Next

OutputFile.Writeline "</body></html>"

' WshShell.Run "Notepad " & "C:\Temp\" & Computername & ".txt", 1

Set ComputerName = Nothing
Set WMIService = Nothing
WScript.Quit