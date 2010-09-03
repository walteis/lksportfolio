' $Workfile: CreateIndex.vbs $ 
' $Revision: 8 $ 
' $Author: Weis $ 
' $Date: 11/02/06 12:45p $ 
'
'==========================================================================
' Purpose: Create Index for mapbook in Word.
'==========================================================================


Dim Conn, rst
Dim Word, WordDoc



Set Conn = CreateObject("ADODB.Connection")
set rst = CreateObject("ADODB.RecordSet")
set cityrst = CreateObject("ADODB.RecordSet")
set Command = CreateObject("ADODB.Command")

On Error resume next
set Word = GetObject(,"Word.Application")

if err then
    set Word = CreateObject("Word.Application")
end if

Word.Documents.Open("x:\template\Public Safety Map Book Index.doc")

Set WordDoc = Word.ActiveDocument

set Parms = WScript.Arguments.Named
if NOT Parms.Exists("source") then
  WScript.Arguments.ShowUsage
  WScript.Quit
end if

' debug setting to show word document
if Parms.Exists("debug") then
    if UCase(WScript.Arguments.Named.Item("debug")) = "YES" then
        Word.Visible = True
    end if
end if


location = WScript.Arguments.Named.Item("source")

Conn.Open "Provider=Microsoft.Jet.OLEDB.4.0;" & _
                   "Data Source=" & location & ";" & _
                   "Extended Properties=""DBASE IV;"";" 
rst.Open "Select SORTORTH.*, citycode.CITYCODE from SORTORTH LEFT OUTER JOIN citycode ON SORTORTH.CITY = citycode.CITYNAME where Name <> ''  order by SORTORD, Name, TYPE, RFADD ",Conn, , ,adCmdText 

rst.MoveFirst

k = 0

symindex = 0
Dim symbols(8)

symbols(1) = "|"
symbols(2) = "/"
symbols(3) = "-"
symbols(4) = "\"
symbols(5) = "|"
symbols(6) = "/"
symbols(7) = "-"
symbols(8) = "\"


WScript.Echo
Wscript.StdOut.Write "Building Full Index..."

do until rst.EOF

    k = k + 1
    
    if k = 1 then 
        Set myRange = WordDoc.Range(0,0)
        Set myTable = WordDoc.Tables.Add(myRange , 41, 8)
    else 
        Set myRange = WordDoc.Tables(k - 1).Range
        myRange.Collapse(False)
        myRange.InsertBreak(2) 
        Set myTable = WordDoc.Tables.Add(myRange , 41, 8)
        Set myRange = WordDoc.Tables(k).Range
    End If
    
    myTable.Columns(1).Width = Word.InchesToPoints(1.58)
    myTable.Columns(2).Width = Word.InchesToPoints(1.07)
    myTable.Columns(3).Width = Word.InchesToPoints(.4)
    myTable.Columns(4).Width = Word.InchesToPoints(.68)
    myTable.Columns(5).Width = Word.InchesToPoints(1.58)
    myTable.Columns(6).Width = Word.InchesToPoints(1.07)
    myTable.Columns(7).Width = Word.InchesToPoints(.4)
    myTable.Columns(8).Width = Word.InchesToPoints(.68)

    Set myRange = WordDoc.Tables(k).Range
    myRange.Font.Size = 8

    for i = 1 to myTable.Columns.Count step 4
      
      myTable.Cell(1, i).Range.InsertAfter "Street Name"
      myTable.Cell(1, i+ 1).Range.InsertAfter "Address Range"
      myTable.Cell(1, i + 2).Range.InsertAfter "Dir"
      myTable.Cell(1, i + 3).Range.InsertAfter "Map"
      myTable.Cell(1, i).Range.Bold = True
      myTable.Cell(1, i+ 1).Range.Bold = True
      myTable.Cell(1, i + 2).Range.Bold = True
      myTable.Cell(1, i + 3).Range.Bold = True
      myTable.Cell(1, i).Range.Font.Size = 10
      myTable.Cell(1, i+ 1).Range.Font.Size = 10
      myTable.Cell(1, i + 2).Range.Font.Size = 10
      myTable.Cell(1, i + 3).Range.Font.Size = 10
      
      For j = 2 to myTable.Rows.Count
      
            symindex = symindex + 1
            printsym = (symindex mod 8) + 1
            Wscript.StdOut.Write(symbols(printsym) + chr(8))

            myTable.Rows(j).Height = Word.InchesToPoints(.2)
            sName = rst.Fields("NAME").Value & " " & rst.Fields("TYPE") & " " & rst.Fields("SUFFIX").Value
                
            selectStr = "Select * from citycode where cityname like '" & rst.Fields("L_CITY").Value & "'"
            cityrst.Open selectStr,Conn, , , adCmdText
            l_city_code = cityrst.Fields("CITYCODE").Value
            cityrst.Close
            selectStr = "Select * from citycode where cityname like '" & rst.Fields("R_CITY").Value & "'"
            cityrst.Open selectStr,Conn, , , adCmdText
            r_city_code = cityrst.Fields("CITYCODE").Value
            cityrst.Close
               
            if l_city_code > "" then
                sName = sName & " (" & l_city_code & ")"
            end if
            if r_city_code > "" and r_city_code <> l_city_code then
                sName = sName & " (" & r_city_code & ")"
            end if
               
            if sName <> saveName then
                printName = sName
                saveName = sName
            else
                printName = " "
            end if
                
            if rst.Fields("ST_CLASS").Value = "2" then
                myTable.Cell(j,i).Range.Bold = True
            End If

            if isNull(rst.Fields("PREFIX").Value) then
                prefix = " "
            else
                prefix = rst.Fields("PREFIX").Value
            end if
                
            If rst.Fields("LFADD").Value < rst.Fields("RFADD").Value Then
                lowAdd = rst.Fields("LFADD").Value
            else
                lowAdd = rst.Fields("RFADD").Value
            End If
                
            If rst.Fields("LTADD").Value > rst.Fields("RTADD").Value Then
                highAdd = rst.Fields("LTADD").Value
            else
                highAdd = rst.Fields("RTADD").Value
            End If
                
            With myTable
                .Cell(j, i).Range.InsertAfter printName
                .Cell(j, i+1).Range.InsertAfter lowAdd & " - " & highAdd
                .Cell(j, i+2).Range.InsertAfter prefix
                .Cell(j, i+3).Range.InsertAfter rst.Fields("ORTHO").Value
            End With
            
            rst.MoveNext
            if rst.EOF then 
                 exit for
            end if
	    Next
        if rst.EOF then
            exit for
        end if
    Next
Loop

filename = "CompleteIndex.doc"
WordDoc.SaveAs(filename)
WordDoc.Close

Wscript.StdOut.Write("Done")

rst.Close

set Conn = Nothing
set rst = Nothing