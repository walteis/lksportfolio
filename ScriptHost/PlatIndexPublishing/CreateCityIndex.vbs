' $Workfile: CreateCityIndex.vbs $ 
' $Revision: 7 $ 
' $Author: Weis $ 
' $Date: 11/02/06 12:45p $ 
'
'==========================================================================
' Purpose: Create Indexes by city for mapbook.
'==========================================================================

dim Conn, rst
dim Word, WordDoc
dim fso, logfile
dim Parms

Set Conn = CreateObject("ADODB.Connection")
set rst = CreateObject("ADODB.RecordSet")
set cityrst = CreateObject("ADODB.RecordSet")
set Command = CreateObject("ADODB.Command")
set fso = CreateObject("Scripting.FileSystemObject")
set Parms = WScript.Arguments.Named


On Error resume next
set Word = GetObject(,"Word.Application")

if err then
    set Word = CreateObject("Word.Application")
end if


if NOT Parms.Exists("city") or NOT Parms.Exists("source") then
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
                   

if Parms.Item("city") = "ALL" then
    cityparm = "%%"
else               
    cityparm = Parms.Item("city")
end if

selectStr = "Select * from citycode where citycode like '" & cityparm & "'"

cityrst.Open selectStr,Conn, , , adCmdText


symindex = 0
Private symbols(8)

symbols(1) = "|"
symbols(2) = "/"
symbols(3) = "-"
symbols(4) = "\"
symbols(5) = "|"
symbols(6) = "/"
symbols(7) = "-"
symbols(8) = "\"


do until cityrst.EOF
    searchcity = cityrst.Fields("CITYNAME")
    selectStr = "Select SUMORTH.* from SUMORTH  where Name <> '' " & _
                "AND L_CITY = '" & searchcity & "' OR R_CITY = '" & searchcity & "' order by SORTORD, Name, Type, LOW "
    rst.Open selectStr,Conn, , , adCmdText
    
    Wscript.Echo
    Wscript.StdOut.Write "Building " & cityrst.Fields("CITYNAME") & " index..."


    rst.MoveFirst
    
    if NOT err then
    
        Word.Documents.Open("x:\template\Public Safety Map Book Index.doc")
        Set WordDoc = Word.ActiveDocument
        k = 0

        With WordDoc.Sections(1).Headers(1)
            .Range.InsertAfter(rst.Fields("CITYNAME"))
            .Range.Paragraphs.Alignment = 1
        End With

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
                    
                    lowAdd = rst.Fields("LOW").Value
                    highAdd = rst.Fields("HIGH").Value
                    
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
        rst.Close
        filename = cityrst.Fields("CITYNAME") & ".doc"
        WordDoc.SaveAs(filename)
        WordDoc.Close
        Wscript.StdOut.Write("Done")

    End If
    cityrst.MoveNext

Loop

' write to log
set logfile = fso.OpenTextFile("c:\temp\indexlog.txt",8,True)
logfile.Write("City Index Finished "  & " | " & Now & CHR(13) & CHR(10))

' Clean up
'rst.Close
set Conn = Nothing
set rst = Nothing
set logfile = Nothing
set fso = Nothing