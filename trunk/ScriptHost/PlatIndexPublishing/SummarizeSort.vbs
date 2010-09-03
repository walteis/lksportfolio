' $Workfile: SummarizeSort.vbs $ 
' $Revision: 7 $ 
' $Author: Weis $ 
' $Date: 8/16/06 9:52a $ 
'
'==========================================================================
' Purpose: Set sort value for roadorth table. Fixes problem with number 
'          street sorting
'==========================================================================



Dim Conn, rst

Set Conn = CreateObject("ADODB.Connection")
set rst = CreateObject("ADODB.RecordSet")
set Command = CreateObject("ADODB.Command")

symindex = 0
dim symbols(8)

symbols(1) = "|"
symbols(2) = "/"
symbols(3) = "-"
symbols(4) = "\"
symbols(5) = "|"
symbols(6) = "/"
symbols(7) = "-"
symbols(8) = "\"

set Parms = WScript.Arguments.Named
if NOT Parms.Exists("source") then
  WScript.Arguments.ShowUsage
  WScript.Quit
end if

location = WScript.Arguments.Named.Item("source")


Conn.Open "Provider=Microsoft.Jet.OLEDB.4.0;" & _
                   "Data Source=" & location & ";" & _
                   "Extended Properties=""DBASE IV;"";" 
rst.Open "Select * from roadorth where Name <> ''  order by Name, ORTHO, TYPE, PREFIX",Conn, , ,adCmdText 

Command.ActiveConnection = Conn

rst.MoveFirst

norecs = rst.RecordCount

first = true

On Error Resume Next
Wscript.Echo 
Wscript.StdOut.Write "Summarizing data..."

symindex = 0

do until rst.EOF

    symindex = symindex + 1
    printsym = (symindex mod 8) + 1
        Wscript.StdOut.Write(symbols(printsym) + chr(8))

    
       
    if saveName = rst.Fields("NAME").Value and saveOrth = rst.Fields("ORTHO").Value _
            and savePrefix = rst.Fields("PREFIX").Value and SaveStreettype = rst.Fields("TYPE").Value then
    
        ' determine low address
        if savedLow > rst.Fields("RFADD").Value and rst.Fields("RFADD").Value <> 0 then
            savedLow = rst.Fields("RFADD").Value
        elseif savedLow > rst.Fields("LFADD").Value and rst.Fields("LFADD").Value <> 0 then
            savedLow = rst.Fields("LFADD").Value
        end if
        
        ' determine high address
        if savedHigh < rst.Fields("LTADD").Value then
            savedHigh = rst.Fields("LTADD").Value
        elseif savedHigh < rst.Fields("RTADD").Value then
            saveHigh = rst.Fields("RTADD").Value
        end if
    
        'msgbox(savedLow)
    
    else
    
        if NOT first then
            ' Write record 
            if savedLow <> 0 and savedHigh <> 0 then
                if savedLow = 0 then
                    savedLow = 1
                end if
       
                SQLfields = "LOW, HIGH, PREFIX, PRE_TYPE, NAME, TYPE, SUFFIX, ST_CLASS," _
                    & "ALIAS, FULLNAME, CITY, L_CITY, R_CITY, ORTHO, SORTORD"

                Command.CommandText = "INSERT INTO SUMORTH (" & SQLfields & ") VALUES ('" & _
                savedLow & "','" & _
                savedHigh & "','" & _
                savePrefix & "','" & _
                pre_type & "','" & _
                saveName & "','" & _
                SaveStreettype & "','" & _
                suffix & "','" & _
                st_class & "','" & _
                alias & "','" & _
                fullname & "','" & _
                city & "','" & _
                l_city & "','" & _
                r_city & "','" & _
                saveOrth & "','" & _
                sSORTORD & "')"
                
                'msgbox(command.CommandText)
                Command.Execute
            end if    
        end if
        
        first = false

        ' re-initialize vars
        if rst.Fields("RFADD").Value < rst.Fields("LFADD").Value then
            savedLow = rst.Fields("RFADD").Value
        else    
            savedLow = rst.Fields("LFADD").Value
        end if
        if rst.Fields("RTADD").Value > rst.Fields("LTADD").Value then
            savedHigh = rst.Fields("RTADD").Value
        else    
            savedHigh = rst.Fields("LTADD").Value
        end if
        
        if savedLow = 0 then
           savedLow = 1
        end if
        savePrefix = rst.Fields("PREFIX").Value
        pre_type = rst.Fields("PRE_TYPE").Value
        saveName = rst.Fields("NAME").Value
        saveSuffix = rst.Fields("SUFFIX").Value
        saveStreettype = rst.Fields("TYPE").Value
        suffix = rst.Fields("SUFFIX").Value
        st_class = rst.Fields("ST_CLASS").Value
        alias = rst.Fields("ALIAS").Value
        fullname = rst.Fields("FULLNAME").Value
        city = rst.Fields("CITY").Value
        l_city = rst.Fields("L_CITY").Value
        r_city = rst.Fields("R_CITY").Value
        saveOrth = rst.Fields("ORTHO").Value
 
        
        ' Get numbered street name (e.g. 100th street)
        i = 1
        while isNumeric(mid(rst.Fields("NAME").Value,i,1))
            i = i + 1
        wend
        
        ' Set sort order - number for numeric streets names, all 9s for alpha
        if NOT isNumeric(mid(rst.Fields("NAME").Value,1,i - 1)) then
        sSORTORD = 99999
        else
        sSORTORD = mid(rst.Fields("NAME").Value,1,i - 1)
        end if
    
     end if 
     
    rst.MoveNext
loop

Wscript.StdOut.Write("Done")


rst.Close

set Conn = Nothing
set rst = Nothing
Set Command = Nothing