' $Workfile: FixSort.vbs $ 
' $Revision: 4 $ 
' $Author: Weis $ 
' $Date: 8/16/06 9:52a $ 
'
'==========================================================================
' Purpose: Set sort value for roadorth table. Fixes problem with number 
'          street sorting
'==========================================================================



private Conn, rst

Set Conn = CreateObject("ADODB.Connection")
set rst = CreateObject("ADODB.RecordSet")
set Command = CreateObject("ADODB.Command")

dim SQLvalues()

set Parms = WScript.Arguments.Named
if NOT Parms.Exists("source") then
  WScript.Arguments.ShowUsage
  WScript.Quit
end if

location = WScript.Arguments.Named.Item("source")

symindex = 0

private symbols(8)

symbols(1) = "|"
symbols(2) = "/"
symbols(3) = "-"
symbols(4) = "\"
symbols(5) = "|"
symbols(6) = "/"
symbols(7) = "-"
symbols(8) = "\"




Conn.Open "Provider=Microsoft.Jet.OLEDB.4.0;" & _
                   "Data Source=" & location & ";" & _
                   "Extended Properties=""DBASE IV;"";" 
                   
rst.Open "Select * from roadorth where Name <> ''  order by Name",Conn, , ,adCmdText 

Command.ActiveConnection = Conn

rst.MoveFirst


i = 0
for each field in rst.Fields

   i = i + 1

next

redim SQLvalues(i)

On Error Resume Next

Wscript.StdOut.Write "Determining Sort Order..."

symindex = 0

do until rst.EOF 

    symindex = symindex + 1
    printsym = (symindex mod 8) + 1
    Wscript.StdOut.Write(symbols(printsym) + chr(8))

    i = 1
    while isNumeric(mid(rst.Fields("NAME").Value,i,1))
        i = i + 1
    wend
    
    if NOT isNumeric(mid(rst.Fields("NAME").Value,1,i - 1)) then
       sSORTORD = 99999
    else
       sSORTORD = mid(rst.Fields("NAME").Value,1,i - 1)
    end if
    
    for k = 0 to UBound(SQLvalues) - 1
       'msgbox(rst.Fields(k).Name)
       if isNull(rst.Fields(k).Value) then
            SQLvalues(k + 1) = " "
       else
            SQLvalues(k + 1) = rst.Fields(k).Value
       End If
    
    next
    
    SQLvalue = "'" & SQLvalues(1) & "'" 
    for k = 2 to ubound(SQLvalues)
        SQLvalue = SQLvalue & ", '" & SQLvalues(k) & "'"
    next
     
     SQLvalue = SQLvalue & "," & sSORTORD
     SQLfields = "LFADD, RFADD, LTADD, RTADD, PREFIX, PRE_TYPE, NAME, TYPE, SUFFIX, ST_CLASS," _
                 & "ALIAS, FULLNAME, CITY, L_CITY, R_CITY, ORTHO, SORTORD"
                
     Command.CommandText = "INSERT INTO SORTORTH (" & SQLfields & ") VALUES (" & SQLvalue & ")"
     
     if Err.number then
         msgbox(command.CommandText)
     end if
    
     Command.Execute    
    rst.MoveNext
loop

Wscript.StdOut.Write("Done")

rst.Close

set Conn = Nothing
set rst = Nothing