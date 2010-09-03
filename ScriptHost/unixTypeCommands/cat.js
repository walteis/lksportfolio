import System.Net;

const version : String = "cat - concatenate files and print on the standard output\n" +
                         "Version .5, 8/26/2005"; 

const error : String = "invalid option ";

const shortusage : String = ", use -? or --help for valid options.";

const usage: String =   "\ncat - concatenate files and print on the standard output\n\n" +
                        "cat [OPTION] [FILE]... ";
                        
const help: String =    "\n\n  -A: equivalent to -vET\n\n" +
                        "  -b: number nonblank output lines \n\n" +
                        "  -e: equivalent to -vE\n\n" +
                        "  -E: display $ at end of each line\n\n" +
                        "  -n: number all output lines\n\n" +
                        "  -s: never more than one single blank line\n\n" +
                        "  -t: equivalent to -vT\n\n" +
                        "  -T: display TAB characters as ^I\n\n" +
                        "  -u: (ignored)\n\n" +
                        "  -v, --show-nonprinting: use ^ and M- notation, except for LFD and TAB\n\n" +
                        "  --help:  display this help and exit\n\n" +
                        "  --version: output version information and exit\n\n" +
                        "  With no FILE read standard input.";             

var args = System.Environment.GetCommandLineArgs();
var files = new Array();
var lineno = 0;
var line = "";
var numblanks = 0;
 
for (var i=1;i<args.length;i++) {
    var work = args[i];
    
    switch (work) {
    
        case "--help":
            System.Console.WriteLine(usage + help);
            System.Environment.Exit(0);
        case "--version":
            System.Console.WriteLine(version);
            System.Environment.Exit(0);
        case "--show-nonprinting":
            var nonprint = true;
            break;
        default:          
            if (work[0] == "-") {
                for (var j=1; j< work.length; j++) {
                    var foo =  work[j];
                        switch (foo) {
                            case "?":
                                System.Console.WriteLine(usage + help);
                                System.Environment.Exit(0);     
                            case "n":
                                var number = true;
                                break;
                            case "b":
                                var numbernoblank = true;
                                break;
                            case "E": 
                                var dollar = true;
                                break;
                            case "T":
                                var tabs = true;
                                break;
                            case "e":
                                var dollar = true;
                            case "v":
                                var nonprint = true;
                                break;
                            case "A":
                                var dollar = true;
                            case "t":
                                var nonprint = true;
                                var tabs = true;
                                break;
                            case "s":
                                var oneblank = true;
                                break;
                            default:
                                System.Console.WriteLine(error + foo + shortusage);
                                System.Environment.Exit(0);
                    }
                }
            }
            else {
                files.push(work);
            }        
    }
}

if  (files.length == 0) 
    files(0) = "CON";


for (var i = 0; i<files.length;i++) {

    if (files[i] != "CON") {
        try {
            System.Console.SetIn(new System.IO.StreamReader(files[i]));
        }
        catch(e : System.IO.IOException) {
            System.Console.Error.WriteLine(e.Message);
            System.Console.Error.WriteLine(usage);
            System.Environment.Exit(1);            
        }
    }
 
    while ((line = System.Console.ReadLine()) != null) {
        var outline = line;
        if (outline == "") {
            if (numblanks >= 1 && oneblank)
                continue;
            else
               numblanks++;
        }
        else
            numblanks = 0;
                   
        if (number || numbernoblank ) {
            if (number || outline != "") {
                outline = ++lineno + " " + outline;    
            }
        }
        if (dollar) { 
            outline += "$";
        }
        if (tabs) {
            var re = /\t/g;
            outline = outline.replace(re, "^I");
        }
            
        if (nonprint) {
            var re = /[\t\n\r\f\v]/g;
            outline = outline.replace(re, "^M");
            }
        try { 
            System.Console.WriteLine(outline);
        }
        catch (e) {
            // do nothing
        }
    } 
}