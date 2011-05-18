//----------------------------------
// erlang - calculate phone traffic
//          stats a magic formula
//          from southwestern bell
//  Here is the explaination I wrote in 1986 for 
//  the Basic version of this program:
//
//  The formula used is the erlang B formula:
//           E^N/N!
//    B= ------------------------------
//       1+E+[E^2/2!]+[E^3/3!]+ ... +[E^N/N!]
// where B is the probibility that all trunks will be busy,
// E is the traffic offered in erlangs, and N is the number or servers
// in the circuit.   In practice, B is the use to determine Grade of Service
// for the circuit.  B gives the overflow for the entire circuit which when
// multiplied by 1000 gives the busies per 1000 attempts.
//      To determine the hours carried for each trunk, B is
// calculated for the first terminal [ B= E/(1+E) ], then the traffic carried
// is subtracted from the total erlangs offered and the next terminal is used
// as the first and so on until all terminals are used.
//----------------------------------
// Copyright 2005, Walt Eis All Rights Reserved
//----------------------------------


function erlang() {
	var nbrTrunks = inputform.trunks.value;
	var dayHours = inputform.tothours.value;
	var dailyHours = inputform.dailyhours.value;
	var nbrDays = inputform.days.value;
	var denom = 0;
	var numer = 0;
	var ptc = 0;
	var erc;
	var hrc;
	var traffic = new Array();
	 
	if (nbrTrunks <= 0 || dayHours <= 0 || dailyHours <=3 || nbrDays <=0) {
		alert("Input Error: Please check.");
	}
	
	var erlangs = getpct(dailyHours) * (dayHours / nbrDays);
	
    numer = Math.pow(erlangs, nbrTrunks) / factorial(nbrTrunks);
    
	for ( var i= nbrTrunks; i>=1; i--) {
		denom += Math.pow(erlangs, i) / factorial(i);
	}
    grade = Math.round(numer / denom * 1000);
	

	// calculate traffic carried
	for ( var i= 0; i <= nbrTrunks; i++) {
		tof = erlangs - ptc;
		erc = tof / (1 + tof);
		hrc = erc * nbrDays / getpct(dailyHours);
		ptc += erc;
		traffic[i] = hrc;
	}

        var table = "";
	
	for (var i=0; i < traffic.length - 1 ; i++) {
		table = table + '<div class="lineno">' + (i+1) + '</div> <div class="trafcount">' + fmtNumber(traffic[i]) + '</div><br>';
	}

        var outwindow = document.getElementById("output");
        outwindow.innerHTML = '<center><h4>Traffic</h4></center>' + 
           '<div class="lineno"><b>Line #</b></div><div class="trafcount"><b>Hours carried</b></div>' + 
            table + '<br><center><b>Busys per 1000 calls</b> ' +
	grade + '</center><br>';
  
}

function fmtNumber(value) {
	var result = Math.floor(value)+".";
	var mantis=100*(value-Math.floor(value));
	result += Math.floor(mantis/10);
	result += Math.floor(mantis%10);
return result;
}


function factorial(number) {
	var fact = 1;
	for (var i=1; i <=number; i++) {
		fact *= i;
	}
	return fact;
}

function getpct(number) {
	var pct;
	
	if (number > 20) {pct = .12}
	else if (number > 15) {pct = .13}
	else if (number > 10) {pct = .14}
	else if (number > 7) {pct = .17}
	else if (number = 7) {pct = .19}
	else if (number = 6) {pct = .23}
	else if (number = 5) {pct = .27}
	else if (number = 4) {pct = .34}
	
	return pct;
} 