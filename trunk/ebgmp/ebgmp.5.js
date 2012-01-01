/* 

Copyright (c) 2005, Walt EisAll rights reserved.
*/

function loadCountyBoundary(countyfile, countytag) {  
// load county border line file
        var request2 = GXmlHttp.create();
   	request2.open("GET", countyfile, true);

	request2.onreadystatechange = function() {
		if (request2.readyState == 4) {
			var xmlDoc = request2.responseXML;
			var markers = xmlDoc.documentElement.getElementsByTagName(countytag);
			var points = [];
			for (var i = 0; i < markers.length; i++) {
		            var lng = parseFloat(WGetValue(markers[i].getElementsByTagName("Longitude")));
	    		    var lat = parseFloat(WGetValue(markers[i].getElementsByTagName("Latitude")));
			    
			    points.push(new GPoint(parseFloat(lng), parseFloat(lat)));
            }
            boundary = new GPolyline(points,"#0000ff",2) 
            map.addOverlay(boundary);

          }

        }
        
request2.send(null);

}

function WLayer(button) {

   this.markers = [];
   this.visible = false;
   this.buttonname = button;

}


function WAddLayerData(request,file, datatag, iconstyle, infowinname) {    
	request.open("GET", file, true);
    var retarray = [];
 
	request.onreadystatechange = function() {
		if (request.readyState == 4) {
			var xmlDoc = request.responseXML;
			var markers = xmlDoc.documentElement.getElementsByTagName(datatag);
			for (var i = 0; i < markers.length; i++) {
			    var lng = parseFloat(WGetValue(markers[i].getElementsByTagName("Longitude")));
			    var lat = parseFloat(WGetValue(markers[i].getElementsByTagName("Latitude")));
			    var point = new GPoint(lng, lat);    
			    retarray.push(new WCreateMarkerObj(point, markers[i], iconstyle, infowinname))
            }
        }
    }
   request.send(null);
   return retarray;
}
      


function WToggleLayer(layerobj) {

    if (layerobj.visible == true ) {
       WRemoveLayer(layerobj.markers);
         layerobj.visible = false;
         document.getElementById(layerobj.buttonname).style.backgroundColor = "transparent";
     }
    else {
         for (var i = 0; i < layerobj.markers.length;i++) {
            var foo = WCreateMarker(layerobj.markers[i].point, layerobj.markers[i].html, layerobj.markers[i].iconstyle);
            map.addOverlay( foo );
            layerobj.markers[i].marker = foo;
         }
       layerobj.visible = true;
       document.getElementById(layerobj.buttonname).style.backgroundColor = "#00ff00";
    }   


}


// Creates a marker and adds listener
// Creates a marker whose info window displays the given number
function WCreateMarker(point, html, iconstyle) {

    var icon = new XIcon('default', iconstyle);
    var marker = new XMarker(point, icon, "", "", html);



    return marker;
}



// Remove layer from map
function WRemoveLayer(layerarray) {

    for (var i = 0; i < layerarray.length;i++) {
	   map.removeOverlay( layerarray[i].marker);  
    }  
}


// Create custom marker object
function WCreateMarkerObj(point, element, iconstyle, infowinname) {

  this.marker = new GMarker(point);
  this.point = point;
  this.iconstyle = iconstyle;
  var placeName = WGetValue(element.getElementsByTagName("PlaceName"))
  var explain = '<br><a href="javascript:showInfo(' + "'" + infowinname + "'" + ');">Explain this</a>';


  try {
	var address = WGetValue(element.getElementsByTagName("Address")) ;
      }
  catch (e) {
	var address = " ";
            }

  try {
	var nature =  "<tr><td width='20%'>&nbsp;</td><td width='175px' STYLE='word-wrap: break-word'>" + WGetValue(element.getElementsByTagName("NatureofContamination")).toLowerCase() + "</td></tr>";
      }
  catch (e) {
	var nature = " ";
            }


  this.html = "<div class=capitalize><table width='250px' border='0'><tr><td width='20%'>Name:</td><td><b>" + placeName.toLowerCase() + "</b>" +
              "</td></tr> <tr><td width='20%'>Address:</td><td>" + address.toLowerCase() + 
               "<br>" + WGetValue(element.getElementsByTagName("City")).toLowerCase() + "</td></tr>" + 
              "<tr><td width='20%'>Type:</td><td>" + WGetValue(element.getElementsByTagName("PlaceType")).toLowerCase() + "</td></tr>" +
             "<tr><td width='20%'>&nbsp;</td><td>" + explain + "</td></tr></table></div>";


}

// grab value from child node    
function WGetValue( element )
{

var value = element[0].firstChild.nodeValue;

return value;
}   


function showInfo(elementname) {

    var tags = document.getElementsByTagName('div');

    if (elementname == "none") {
         document.getElementById("content").style.display = 'none';     
         return;
    } 
                        
    document.getElementById("content").style.display = 'block';     

    
    for (key=0;key<tags.length;key++) {
        if (tags[key].id.substring(0,4) == 'info') {
              if (tags[key].id == elementname) {
                    document.getElementById(tags[key].id).style.display = 'block';
                     var buttonname = tags[key].id + 'button';
              }
              else {
                    document.getElementById(tags[key].id).style.display = 'none';     
               }
         }    
    }

}     
  
