// Copyright 2005 Walt Eis
    


function WLayer(button) {

   this.markers = [];
   this.visible = false;
   this.buttonname = button;

}


function WAddLayerData(request,file, datatag) {    
 // load Contaminated Sites file   
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
			    retarray.push(new WCreateMarkerObj(point, markers[i]))
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
            var foo = WCreateMarker(layerobj.markers[i].point, layerobj.markers[i].html);
            map.addOverlay( foo );
            layerobj.markers[i].marker = foo;
         }
       layerobj.visible = true;
       document.getElementById(layerobj.buttonname).style.backgroundColor = "#00ff00";
    }   


}


// Creates a marker and adds listener
// Creates a marker whose info window displays the given number
function WCreateMarker(point, html) {
  var marker = new GMarker(point);

  // Show this marker's index in the info window when it is clicked
  GEvent.addListener(marker, "click", function() {
    marker.openInfoWindowHtml(html);
  });

  return marker;
}



// Remove layer from map
function WRemoveLayer(layerarray) {

    for (var i = 0; i < layerarray.length;i++) {
	   map.removeOverlay( layerarray[i].marker);  
    }  
}


// Create custom marker object
function WCreateMarkerObj(point, element) {
  this.marker = new GMarker(point);
  this.point = point;
  var placeName = WGetValue(element.getElementsByTagName("PlaceName"))


  try {
	var address = WGetValue(element.getElementsByTagName("Address"));
      }
  catch (e) {
	var address = "Address not recorded";
            }

  this.html = "<div class=capitalize><center><b>" + placeName.toLowerCase() + "</b><br>" + 
              address.toLowerCase() + "<br>"  + 
              WGetValue(element.getElementsByTagName("City")).toLowerCase() + "<br>" + 
              WGetValue(element.getElementsByTagName("PlaceType")).toLowerCase() + "</center></div>";
}

// grab value from child node    
function WGetValue( element )
{

var value = element[0].firstChild.nodeValue;

return value;
}   
