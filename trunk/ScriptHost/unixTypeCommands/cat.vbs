
dim fso

nonprintchars = "\x00|\x01|\x02|\x03|\x04|\x05|\x06|\x07|\x0B|\x0C|\x0E" & _
                "|\x0F|\x10|\x11|\x12|\x13|\x14|\x15|\x16|\x17|\x18|\x19" & _
                "|\x1A|\x1B|\x1C|\x1D|\x1E|\x1F"
             

set fso = CreateObject("Scripting.FileSystemObject")

for each foo in WScript.Arguments.Named
  if NOT testarg(foo, "([AnbEeTtv])|(\?)|(help)|(version)") then
    Wscript.StdOut.WriteLine "Illegal option /" & foo
    Wscript.StdOut.WriteLine "Use /help or /? for option help"
    Wscript.Quit
  elseif foo = "version" then
    Wscript.StdOut.WriteLine "Version .1 8/25/2005"
    WScript.Quit      
  elseif foo = "?" or foo = "help" then
    WriteHelp()
    WScript.Quit      
  elseif testarg(foo,"n") then
    number = true
  elseif testarg(foo,"b") then
    numbernoblank = true
  elseif testarg(foo,"E") then 
    dollar = true
  elseif testarg(foo,"T") then 
    tabs = true
  elseif testarg(foo,"v") then 
    nonprint = true
  elseif testarg(foo,"e") then 
    nonprint = true
    dollar = true
  elseif testarg(foo,"A") then 
    nonprint = true
    dollar = true
    tabs = true
  elseif testarg(foo,"t") then 
    nonprint = true
    tabs = true
  end if
next


lineno = 1

if  WScript.Arguments.UnNamed.Count = 0 then
    dim files(1)
    files(1) = "CON:"
else
    set files = WScript.Arguments.UnNamed
end if


for each file in files
  if fso.FileExists(file) then
        set f = fso.OpenTextFile(file,1)
        do until f.AtEndOfStream = True
            outline = f.ReadLine
            if number or numbernoblank then
                if numbernoblank and outline = "" then
                    outline = outline
                else
                    outline = lineno & " " & outline
                    lineno = lineno + 1
                end if
            end if
            if dollar then
                outline = outline & "$"
            end if
            if tabs then
                outline = replacechars(outline, "\t", "^I")
            end if
            if nonprint then
                outline = replacechars(outline, nonprintchars, "^M")
            end if
            WScript.StdOut.WriteLine outline
        loop
  end if
next


function WriteHelp()

   Wscript.StdOut.WriteLine "cat - concatenate files and print on the standard output"
   Wscript.StdOut.WriteLine " "
   Wscript.StdOut.WriteLine "cat [OPTION] [FILE]... "
   Wscript.StdOut.WriteLine " "
   Wscript.StdOut.WriteLine "  /A, equivalent to /v /E /T"
   Wscript.StdOut.WriteLine " "
   Wscript.StdOut.WriteLine "  /b, number nonblank output lines"
   Wscript.StdOut.WriteLine " "
   Wscript.StdOut.WriteLine "  /e, equivalent to /v /E"
   Wscript.StdOut.WriteLine " "
   Wscript.StdOut.WriteLine "  /E, display $ at end of each line"
   Wscript.StdOut.WriteLine " "
   Wscript.StdOut.WriteLine "  /n, number all output lines"
   Wscript.StdOut.WriteLine " "
   Wscript.StdOut.WriteLine "  /s, never more than one single blank line - TODO"
   Wscript.StdOut.WriteLine " "
   Wscript.StdOut.WriteLine "  /t, equivalent to -vT - TODO"
   Wscript.StdOut.WriteLine " "
   Wscript.StdOut.WriteLine "  /T, display TAB characters as ^I"
   Wscript.StdOut.WriteLine " "
   Wscript.StdOut.WriteLine "  /u     (ignored)"
   Wscript.StdOut.WriteLine " "
   Wscript.StdOut.WriteLine "  /v, --show-nonprinting, use ^ and M- notation, except for LFD and TAB"
   Wscript.StdOut.WriteLine " "
   Wscript.StdOut.WriteLine "  /help,  display this help and exit"
   Wscript.StdOut.WriteLine " "
   Wscript.StdOut.WriteLine "  /version, output version information and exit"
   Wscript.StdOut.WriteLine " "
   Wscript.StdOut.WriteLine "  With no FILE, or when FILE is -, read standard input."


End Function


function testarg(strng, patrn)

  Dim regEx, retVal            ' Create variable.
  Set regEx = New RegExp         ' Create regular expression.
  regEx.Pattern = patrn
  regEx.IgnoreCase = False      ' Set case sensitivity.
  testarg = regEx.Test(strng)      ' Execute the search test.
  
end function

function replacechars(strng, patrn, restr)

  Dim regEx, retVal            ' Create variable.
  Set regEx = New RegExp         ' Create regular expression.
  regEx.Pattern = patrn
  regEx.IgnoreCase = False      ' Set case sensitivity.
  replacechars = regEx.replace(strng,restr)      ' Execute the search test.
  
end function