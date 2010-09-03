import System.Net;

const version : String = "head - display first few lines of files\n" +
                         "Version .1, 8/26/2005"; 

const error : String = "invalid option ";

const shortusage : String = ", use -? or --help for valid options.";

const usage: String =   "head - display first few lines of files\n\n" +
                        "head [-number | -n number]  [filename...]";            

var args = System.Environment.GetCommandLineArgs();
var files = new Array();
var havenum = false;
var line = "";
var nolines = 10;
 
for (var i=1;i<args.length;i++) {
    var work = args[i];
    
    if (work[0] == "-") {
        if (work[1] == "n") {
            nolines = parseInt(args[++i]);
        }
        else if (work[1] == "?") {
            System.Console.WriteLine(usage);
            System.Environment.Exit(0);  
        } 
        else             
            var nolines = parseInt(work.substr(1));
    }
    else {
        files.push(work);
    }        
    
}

if  (files.length == 0) 
    files(0) = "CON";


for (var i = 0; i<files.length;i++) {

    if (files.length>1) {
        System.Console.WriteLine("==> " + files[i] + " <==");
    }

    if (files[0] != "CON") {
        try {
            System.Console.SetIn(new System.IO.StreamReader(files[i]));
        }
        catch(e : System.IO.IOException) {
            System.Console.Error.WriteLine(e.Message);
            System.Console.Error.WriteLine(usage);
            System.Environment.Exit(1);            
        }
    }
    for (var j=0;j<nolines;j++) {
    
        try {
            line = System.Console.ReadLine();
        }
        catch (e) {
            break;
        }
        
        try { 
            System.Console.WriteLine(line);
        }
        catch(e : System.IO.IOException) {
            System.Console.Error.WriteLine(e.Message);
            System.Console.Error.WriteLine(usage);
            System.Environment.Exit(1);            
        }
    } 
}