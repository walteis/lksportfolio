/**
 * XMaps Library - A library of extensions for the Google Maps API.
 * Release 1a - 10 August 2005
 * http://xmaps.busmonster.com/
 *
 * Copyright 2005 Chris Smoak (chris.smoak@gmail.com)
 *
 * This software comes with no warranty, whatsoever.
 *
 * You can access the full license for this software at:
 * http://xmaps.busmonster.com/license.html
 *
 **/


function XDebug() {};
XDebug.write = function() {}


// Random Array methods that probably don't exist yet and are very useful. Then
// again, I don't use them here--but feel free to use them yourself... =)

Array.prototype.copy = function() {
    var arr = [];
    for (var i = 0; i < this.length; i++) {
        arr[i] = this[i];
    }
    return arr
}

Array.prototype.map = function(func) {
    for (var i = 0; i < this.length; i++) {
        this[i] = func(this[i]);
    }
    return this
}

Array.prototype.each = function(func) {
    for (var i = 0; i < this.length; i++) {
        func(this[i]);
    }
}

Array.prototype.concat = function(arr) {
    for (var i = 0; i < arr.length; i++) {
        this.push(arr[i]);
    }
}


// XUserAgent is a copy of the user agent code in maps.10.js

// user agent types
XUserAgent.IE = 1;
XUserAgent.MOZILLA = 2;
XUserAgent.SAFARI = 3;
XUserAgent.OPERA = 4;

// user agent OSes
XUserAgent.WIN = 0;
XUserAgent.NIX = 1;
XUserAgent.MAC = 2;

function XUserAgent(type, version, os) { this.type = type; this.version = version; this.os = os };

XUserAgent.create = function() {
    var userAgent = new XUserAgent(0, 0, null);
    var userAgentName = navigator.userAgent.toLowerCase();
    if (userAgentName.indexOf("opera") != -1) {
        userAgent.type = XUserAgent.OPERA;
        if (userAgentName.indexOf("opera/7") != -1 || userAgentName.indexOf("opera 7") != -1) {
            userAgent.version = 7
        } else if (userAgentName.indexOf("opera/8") != -1 || userAgentName.indexOf("opera 8") != -1) {
            userAgent.version = 8
        }
    } else if (userAgentName.indexOf("msie") != -1 && document.all) {
        userAgent.type = XUserAgent.IE;
        if (userAgentName.indexOf("msie 5")) { userAgent.version = 5 }
    } else if (userAgentName.indexOf("safari") != -1) { userAgent.type = XUserAgent.SAFARI }
    else if (userAgentName.indexOf("mozilla") != -1) { userAgent.type = XUserAgent.MOZILLA }
    if (userAgentName.indexOf("x11;") != -1) { userAgent.os = XUserAgent.NIX }
    else if (userAgentName.indexOf("macintosh") != -1) { userAgent.os = XUserAgent.MAC }

    return userAgent;
};


// XDistance provides convenience functions for converting between various
// measures of distance.

XDistance.M = 0;
XDistance.KM = 1;
XDistance.FT = 2;
XDistance.MI = 3;
XDistance.NM = 4;

//XDistance.latConstantMeters = 180 / XDistance.earthRadiusInMetersWGS84 / Math.PI;
//XDistance.latConstantMiles = 180 / XDistance.earthRadiusInMilesWGS84 / Math.PI;

XDistance.conversionTable = [
    [1, 1 / 1000, 3.2808399, 0.000621371192, 0.000539956803],
    [1000, 1, 3280.8399, 0.621371192, 0.539956803],
    [0.3048, 0.0003048, 1, 1 / 5280, 0.000164578834],
    [1609.344, 1.609344, 5280, 1, 0.868976242],
    [1852, 1.85200, 6076.11549, 1.15077945, 1]
];

function XDistance(value, units) {
    this.value = value;
    this.units = units;
}

XDistance.prototype.convert = function(toUnits) { return XDistance.convert(this.value, this.units, toUnits) }

XDistance.prototype.toMeters = function() { return XDistance.convert(this.value, this.units, XDistance.M) }
XDistance.prototype.toKilometers = function() { return XDistance.convert(this.value, this.units, XDistance.KM) }
XDistance.prototype.toFeet = function() { return XDistance.convert(this.value, this.units, XDistance.FT) }
XDistance.prototype.toMiles = function() { return XDistance.convert(this.value, this.units, XDistance.MI) }
XDistance.prototype.toNauticalMiles = function() { return XDistance.convert(this.value, this.units, XDistance.NM) }

XDistance.convert = function(value, fromUnits, toUnits) {
    return value * XDistance.conversionTable[fromUnits][toUnits];
}

XDistance.between = function(point1, point2) {
    return XMaps.model.getDistanceAndAngle(point1, point2).distance;
}

XDistance.resolveToMeters = function(distanceOrMeters) {
    if (typeof distanceOrMeters == 'number') {
        return distanceOrMeters
    } else {
        return distanceOrMeters.toMeters()
    }
}


XAngle.RAD = 0;
XAngle.DEG = 1;

XAngle.radToDeg = 180 / Math.PI;
XAngle.degToRad = Math.PI / 180;

XAngle.conversionTable = [
    [1, XAngle.radToDeg],
    [XAngle.degToRad, 1]
];

XAngle.normalizeRadians = function(rad) {
    while (rad < 0) { rad += 2 * Math.PI }
    while (rad > 2 * Math.PI) { rad -= 2 * Math.PI }
    return rad
}

XAngle.normalizeDegrees = function(deg) {
    while (deg < 0) { deg += 360 }
    while (deg > 360) { deg -= 360 }
    return deg
}

XAngle.normalizationTable = [
    XAngle.normalizeRadians,
    XAngle.normalizeDegrees
];

function XAngle(value, units) {
    this.value = value;
    this.units = units;
}

XAngle.prototype.convert = function(toUnits) { return XAngle.convert(this.value, this.units, toUnits) }

XAngle.prototype.toRadians = function() { return XAngle.convert(this.value, this.units, XAngle.RAD) }

XAngle.prototype.toDegrees = function() { return XAngle.convert(this.value, this.units, XAngle.DEG) }

XAngle.prototype.normalize = function() {
    this.value = XAngle.normalizationTable[this.units](this.value);
}

XAngle.convert = function(value, fromUnits, toUnits) {
    if (fromUnits == toUnits) {
        return value;
    } else {
        return value * XAngle.conversionTable[fromUnits][toUnits];
    }
}

XAngle.radiansToDegrees = function(radians) {
    var deg = radians * XAngle.radToDeg;
    while (deg < 0) { deg += 360 }
    while (deg >= 360) { deg -= 360 }
    return deg
}

XAngle.degreesToRadians = function(degrees) {
    var rad = degrees * XAngle.degToRad;
    while (rad < 0) { rad += 2 * Math.PI }
    while (rad >= 2 * Math.PI) { rad -= 2 * Math.PI }
    return rad
}

XAngle.resolveToRadians = function(angleOrRadians) {
    if (typeof angleOrRadians == 'number') {
        return XAngle.normalizeRadians(angleOrRadians)
    } else {
        angleOrRadians.normalize();
        return angleOrRadians.toRadians()
    }
}


function XDistanceAndAngle(distance, angle) {
    this.distance = distance;
    this.angle = angle;
}


// XModel is a model of the world we're mapping.
// The meat of this class is from the source code of Navigate for Palm OS,
// written by Rick Chapman.
// http://fermi.jhuapl.edu/navigate/index.html

function XModel(flatteningFactor, semimajorAxis) {
    this.flatteningFactor = flatteningFactor;
    this.semimajorAxisInMeters = semimajorAxis.toMeters();
}

XModel.prototype.getDistanceAndAngle = function(from, to, distance, angle, distanceAndAngle) {
    distance = distance || new XDistance();
    distance.units = XDistance.M;

    angle = angle || new XAngle();
    angle.units = XAngle.RAD;

    distanceAndAngle = distanceAndAngle || new XDistanceAndAngle();
	distanceAndAngle.distance = distance;
	distanceAndAngle.angle = angle;

    var f = 1 / this.flatteningFactor;
    var ra = this.semimajorAxisInMeters;
    var eps = 5e-14;

    var r = 1 - f;
    var tu1 = r * Math.tan(from.y / XAngle.radToDeg);
    var tu2 = r * Math.tan(to.y / XAngle.radToDeg);
    var cu1 = 1 / Math.sqrt(tu1 * tu1 + 1);
    var su1 = cu1 * tu1;
    var cu2 = 1 / Math.sqrt(tu2 * tu2 + 1);
    var s = cu1 * cu2;
    var baz = s * tu2;
    var faz = baz * tu1;
    var x = (to.x - from.x) / XAngle.radToDeg;

    var d, sx, cx, sy, cy, cz, c2a, c, e, y, sa;
    var count = 0;
	do {
		sx = Math.sin(x);
		cx = Math.cos(x);
		tu1 = cu2 * sx;
		tu2 = baz - su1 * cu2 * cx;
		sy = Math.sqrt(tu1 * tu1 + tu2 * tu2);
		cy = s * cx + faz;
		y = Math.atan2(sy, cy);
		sa = s * sx / sy;
		c2a = -sa * sa + 1;
		cz = faz + faz;
		if (c2a > 0) { cz = -cz / c2a + cy }
		e = cz * cz * 2 - 1;
		c = ((-3 * c2a + 4) * f + 4) * c2a * f / 16;
		d = x;
		x = ((e * cy * c + cz) * sy * c + y) * sa;
		x = (1 - c) * x * f + (to.x - from.x) / XAngle.radToDeg;
	} while (Math.abs(d - x) > eps || count++ == 100);
	faz = Math.atan2(tu1, tu2);
	baz = Math.atan2(cu1 * sx, baz * cx - su1 * cu2) + Math.PI;
	x = Math.sqrt((1 / r / r - 1) * c2a + 1) + 1;
	x = (x - 2) / x;
	c = 1 - x;
	c = (x * x / 4 + 1) / c;
	d = (0.375 * x * x - 1) * x;
	x = e * cy;
	s = 1 - e * e;
	s = ((((sy * sy * 4 - 3) * s * cz * d / 6 - x) * d / 4 + cz) * sy * d + y) * c * ra * r;

	distance.value = s;
	angle.value = XAngle.normalizeRadians(faz);

	return distanceAndAngle;
}

XModel.prototype.getPointAtDistanceAndAngle = function(point, distance, angle, outPoint) {
    var meters = XDistance.resolveToMeters(distance);
    var radians = XAngle.resolveToRadians(angle);

    outPoint = outPoint || new GPoint();

	var f = 1 / this.flatteningFactor;
	var ra = this.semimajorAxisInMeters;
	var eps = 1e-13;
	var r = 1 - f;
	var tu = r * Math.tan(point.y * XAngle.degToRad);
	var sf = Math.sin(radians);
	var cf = Math.cos(radians);
	var baz = Math.atan2(tu, cf) * 2;
	var cu = 1 / Math.sqrt(tu * tu + 1);
	var su = tu * cu;
	var sa = cu * sf;
	var c2a = 1 - sa * sa;
	var x = Math.sqrt((1 / r / r - 1) * c2a + 1) + 1;
	var c, d, y, sy, cy, cz, e;

	x = (x - 2) / x;
	c = 1 - x;
	c = (x * x / 4 + 1) / c;
	d = (0.375 * x * x - 1) * x;
	tu = meters / r / ra / c;
	y = tu;
	var count = 0;
	do {
		sy = Math.sin(y);
		cy = Math.cos(y);
		cz = Math.cos(baz + y);
		e = cz * cz * 2 - 1;
		c = y;
		x = e * cy;
		y = e * e - 1;
		y = (((sy * sy * 4 - 3) * y * cz * d / 6 + x) * d / 4 - cz) * sy * d + tu;
	} while(Math.abs(y - c) > eps || count++ == 100);
	baz = cu * cy * cf - su * sy;
	c = r * Math.sqrt(sa * sa + baz * baz);
	d = su * cy + cu * sy * cf;
	var lat2 = Math.atan2(d, c) / XAngle.degToRad;
	c = cu * cy - su * sy * cf;
	x = Math.atan2(sy * sf, c);
	c = ((-3 * c2a + 4) * f + 4) * c2a * f / 16;
	d = ((e * cy * c + cz) * sy * c + y) * sa;
	var lng2 = (point.x * XAngle.degToRad + x - (1 - c) * d * f) / XAngle.degToRad;
	baz = Math.atan2(sa, baz) + Math.PI;

	outPoint.x = lng2;
	outPoint.y = lat2;

	return outPoint
}

XModel.earth = new XModel(298.257223563, new XDistance(6378137, XDistance.M));


// XMaps is the namespace for functions in GMaps that are not exposed but should be along
// with a bunch of other useful code. Some of these functions are copied from maps.10.js.

function XMaps() {};

XMaps.getElementById = function(id) { return document.getElementById(id) }

XMaps.userAgent = XUserAgent.create();

XMaps.toPixelString = function(pixels) { return Math.round(pixels) + "px" }

XMaps.addClassName = function(element, className) {
    if(element.className) {
        element.className += " " + className
    } else {
        element.className = className
    }
}

XMaps.falseFunction = function() { return false }

XMaps.integerCompare = function(a, b) { return (a < b) ? -1 : ((a > b) * 1); }

XMaps.defaultColor = { red: 0, green: 0, blue: 0xff };

XMaps.parseColor = function(color, defaultColor) {
    try {
        if (color.charAt(0) == "#") {
            color = color.substring(1)
        }
        var red = parseInt(color.substring(0, 2), 16);
        var green = parseInt(color.substring(2, 4), 16);
        var blue = parseInt(color.substring(4, 6), 16);
        return { red: red, green: green, blue: blue };
    } catch (e) {
        if (typeof defaultColor == 'object') {
            return defaultColor
        } else {
            return XMaps.parseColor(defaultColor, XMaps.defaultColor)
        }
    }
}

XMaps.defaultFont = {
    '*': { width: 15, points: [0,-6,2,-2,2,-2,5,-2,5,-2,2,0,2,0,3,4,3,4,0,2,0,2,-3,4,-3,4,-2,0,-2,0,-5,-2,-5,-2,-2,-2,-2,-2,0,-6] },
    ' ': { width: 10, points: [] },
    '+': { width: 11, points: [-3,0,3,0,0,3,0,-3] },
    '-': { width: 11, points: [-3,0,3,0] },
    'A': { width: 13, points: [-4,5,0,-5,0,-5,4,5,4,5,2,0,2,0,-2,0] },
    'B': { width: 13, points: [-4,5,-4,-5,-4,-5,2,-5,2,-5,4,-3,4,-3,4,-2,4,-2,2,0,2,0,0,0,0,0,2,0,2,0,4,2,4,2,4,3,4,3,2,5,2,5,-4,5] },
    'C': { width: 13, points: [4,3,2,5,2,5,-2,5,-2,5,-4,3,-4,3,-4,-3,-4,-3,-2,-5,-2,-5,2,-5,2,-5,4,-3] },
    'D': { width: 13, points: [-4,5,-4,-5,-4,-5,2,-5,2,-5,4,-3,4,-3,4,3,4,3,2,5,2,5,-4,5] },
    'E': { width: 13, points: [4,5,-4,5,-4,5,-4,0,-4,0,2,0,2,0,-4,0,-4,0,-4,-5,-4,-5,4,-5] },
    'F': { width: 13, points: [-4,5,-4,0,-4,0,2,0,2,0,-4,0,-4,0,-4,-5,-4,-5,4,-5] },
    'G': { width: 13, points: [4,-3,2,-5,2,-5,-2,-5,-2,-5,-4,-3,-4,-3,-4,3,-4,3,-2,5,-2,5,2,5,2,5,4,3,4,3,4,2,4,2,2,0] },
    'H': { width: 13, points: [-4,5,-4,-5,-4,-5,-4,0,-4,0,4,0,4,0,4,5,4,5,4,-5] },
    'I': { width: 7, points: [-1,5,1,5,1,5,0,5,0,5,0,-5,0,-5,-1,-5,-1,-5,1,-5] },
    'J': { width: 9, points: [0,-5,2,-5,2,-5,1,-5,1,-5,1,3,1,3,-1,5,-1,5,-2,5] },
    'K': { width: 13, points: [-4,5,-4,-5,-4,-5,-4,0,-4,0,4,5,4,5,-4,0,-4,0,4,-5] },
    'L': { width: 13, points: [4,5,-4,5,-4,5,-4,-5] },
    'M': { width: 15, points: [-5,5,-5,-5,-5,-5,0,0,0,0,5,-5,5,-5,5,5] },
    'N': { width: 13, points: [-4,5,-4,-5,-4,-5,4,5,4,5,4,-5] },
    'O': { width: 13, points: [-4,3,-4,-3,-4,-3,-2,-5,-2,-5,2,-5,2,-5,4,-3,4,-3,4,3,4,3,2,5,2,5,-2,5,-2,5,-4,3] },
    'P': { width: 13, points: [-4,5,-4,-5,-4,-5,2,-5,2,-5,4,-3,4,-3,4,-2,4,-2,2,0,2,0,-4,0] },
    'Q': { width: 13, points: [-4,3,-4,-3,-4,-3,-2,-5,-2,-5,2,-5,2,-5,4,-3,4,-3,4,3,4,3,2,5,2,5,-2,5,-2,5,-4,3,-4,3,-2,5,-2,5,2,5,2,5,1,3,1,3,4,5] },
    'R': { width: 13, points: [-4,5,-4,-5,-4,-5,2,-5,2,-5,4,-3,4,-3,4,-2,4,-2,2,0,2,0,-4,0,-4,0,4,5] },
    'S': { width: 13, points: [3,-4,2,-5,2,-5,-2,-5,-2,-5,-4,-3,-4,-3,-4,-2,-4,-2,-2,0,-2,0,2,0,2,0,4,2,4,2,4,3,4,3,2,5,2,5,-2,5,-2,5,-3,4] },
    'T': { width: 13, points: [-4,-5,4,-5,4,-5,0,-5,0,-5,0,5] },
    'U': { width: 13, points: [-4,-5,-4,3,-4,3,-2,5,-2,5,2,5,2,5,4,3,4,3,4,-5] },
    'V': { width: 13, points: [-4,-5,0,5,0,5,4,-5] },
    'W': { width: 13, points: [-4,-5,-1,5,-1,5,0,3,0,3,2,5,2,5,4,-5] },
    'X': { width: 13, points: [-4,-5,4,5,-4,5,4,-5] },
    'Y': { width: 13, points: [-4,-5,0,0,0,0,4,-5,4,-5,0,0,0,0,0,5] },
    'Z': { width: 13, points: [-4,-5,4,-5,4,-5,-4,5,-4,5,4,5] },
    'a': { width: 13, points: [-2,5,-4,3,-4,3,-4,0,-4,0,-2,-2,-2,-2,2,-2,2,-2,4,0,4,0,4,-2,4,-2,4,5,4,5,4,3,4,3,2,5,2,5,-2,5] },
    'b': { width: 13, points: [-4,-5,-4,5,-4,5,-4,3,-4,3,-2,5,-2,5,2,5,2,5,4,3,4,3,4,0,4,0,2,-2,2,-2,-2,-2,-2,-2,-4,0] },
    'c': { width: 12, points: [3,-1,2,-2,2,-2,-2,-2,-2,-2,-4,0,-4,0,-4,3,-4,3,-2,5,-2,5,2,5,2,5,3,4] },
    'd': { width: 13, points: [4,5,4,3,4,3,2,5,2,5,-2,5,-2,5,-4,3,-4,3,-4,0,-4,0,-2,-2,-2,-2,2,-2,2,-2,4,0,4,0,4,5,4,5,4,-5] },
    'e': { width: 13, points: [3,4,2,5,2,5,-2,5,-2,5,-4,3,-4,3,-4,0,-4,0,-2,-2,-2,-2,2,-2,2,-2,4,0,4,0,-2,0] },
    'f': { width: 9, points: [-2,5,-2,0,-2,0,2,0,2,0,-2,0,-2,0,-2,-3,-2,-3,0,-5,0,-5,2,-5] },
    'g': { width: 13, points: [4,0,2,-2,2,-2,-2,-2,-2,-2,-4,0,-4,0,-4,2,-4,2,-2,4,-2,4,2,4,2,4,4,2,4,2,4,-2,4,-2,4,7,4,7,2,9,2,9,-2,9] },
    'h': { width: 13, points: [-4,-5,-4,5,-4,5,-4,0,-4,0,-2,-2,-2,-2,2,-2,2,-2,4,0,4,0,4,5] },
    'i': { width: 6, points: [-1,-1,0,-1,0,-1,0,5,0,-5,-1,-5] },
    'j': { width: 8, points: [-1,-1,0,-1,0,-1,0,7,0,7,-2,9,0,-5,-1,-5] },
    'k': { width: 13, points: [-4,-5,-4,5,-4,5,-4,1,-4,1,4,-2,4,-2,-4,1,-4,1,4,5] },
    'l': { width: 6, points: [-1,-5,0,-5,0,-5,0,5] },
    'm': { width: 13, points: [-4,5,-4,-2,-4,-2,-4,-1,-4,-1,-3,-2,-3,-2,-1,-2,-1,-2,0,-1,0,-1,0,4,0,4,0,-1,0,-1,1,-2,1,-2,3,-2,3,-2,4,-1,4,-1,4,5] },
    'n': { width: 13, points: [-4,5,-4,-2,-4,-2,-4,0,-4,0,-2,-2,-2,-2,2,-2,2,-2,4,0,4,0,4,5] },
    'o': { width: 13, points: [-4,0,-2,-2,-2,-2,2,-2,2,-2,4,0,4,0,4,3,4,3,2,5,2,5,-2,5,-2,5,-4,3,-4,3,-4,0] },
    'p': { width: 13, points: [-4,-2,-4,9,-4,9,-4,3,-4,3,-2,5,-2,5,2,5,2,5,4,3,4,3,4,0,4,0,2,-2,2,-2,-2,-2,-2,-2,-4,0] },
    'q': { width: 13, points: [4,0,2,-2,2,-2,-2,-2,-2,-2,-4,0,-4,0,-4,3,-4,3,-2,5,-2,5,2,5,2,5,4,3,4,3,4,-2,4,-2,4,9] },
    'r': { width: 13, points: [-4,-2,-4,5,-4,5,-4,0,-4,0,-2,-2,-2,-2,2,-2,2,-2,4,0] },
    's': { width: 13, points: [4,-2,-2,-2,-2,-2,-4,0,-4,0,-3,1,-3,1,2,1,2,1,4,3,4,3,2,5,2,5,-2,5] },
    't': { width: 9, points: [-2,-5,-2,0,-2,0,2,0,2,0,-2,0,-2,0,-2,3,-2,3,0,5,0,5,2,5] },
    'u': { width: 13, points: [-4,-2,-4,3,-4,3,-2,5,-2,5,2,5,2,5,4,3,4,3,4,-2,4,-2,4,5] },
    'v': { width: 13, points: [-4,-2,0,5,0,5,4,-2] },
    'w': { width: 13, points: [-4,-2,-3,5,-3,5,0,0,0,0,3,5,3,5,4,-2] },
    'x': { width: 13, points: [-4,-2,4,5,-4,5,4,-2] },
    'y': { width: 13, points: [-4,-2,0,4,0,4,4,-2,4,-2,-4,9] },
    'z': { width: 13, points: [-4,-2,4,-2,4,-2,-4,5,-4,5,4,5] },
    '.': { width: 6, points: [-1,4,0,5,-1,5,0,4] },
    '>': { width: 13, points: [-4,5,4,0,4,0,-4,-5,-4,-5,-4,5] },
    '#': { width: 13, points: [-4,3,4,3,-4,-3,4,-3,-2,5,-2,-5,2,5,2,-5] },
    '0': { width: 13, points: [-4,3,-4,-3,-4,-3,-2,-5,-2,-5,2,-5,2,-5,4,-3,4,-3,4,3,4,3,2,5,2,5,-2,5,-2,5,-4,3,-4,3,-2,5,-2,5,2,-5] },
    '1': { width: 7, points: [-1,-3,1,-5,1,-5,1,5] },
    '2': { width: 13, points: [-4,-3,-2,-5,-2,-5,2,-5,2,-5,4,-3,4,-3,4,-2,4,-2,-4,4,-4,4,-4,5,-4,5,4,5] },
    '3': { width: 13, points: [-4,-4,-3,-5,-3,-5,2,-5,2,-5,4,-3,4,-3,4,-2,4,-2,2,0,2,0,-2,0,-2,0,2,0,2,0,4,2,4,2,4,3,4,3,2,5,2,5,-3,5,-3,5,-4,4] },
    '4': { width: 13, points: [-4,-5,-4,0,-4,0,4,0,1,-5,1,5] },
    '5': { width: 13, points: [4,-5,-4,-5,-4,-5,-4,-1,-4,-1,2,-1,2,-1,4,0,4,0,4,3,4,3,2,5,2,5,-4,5] },
    '6': { width: 13, points: [3,-5,-1,-5,-1,-5,-4,-2,-4,-2,-4,3,-4,3,-2,5,-2,5,2,5,2,5,4,3,4,3,4,1,4,1,2,-1,2,-1,-3,-1] },
    '7': { width: 13, points: [-4,-5,4,-5,4,-5,4,-2,4,-2,0,1,0,1,0,5] },
    '8': { width: 13, points: [-2,-5,-4,-3,-4,-3,-4,-2,-4,-2,-2,0,-2,0,-4,2,-4,2,-4,3,-4,3,-2,5,-2,5,2,5,2,5,4,3,4,3,4,2,4,2,2,0,2,0,-2,0,-2,0,2,0,2,0,4,-2,4,-2,4,-3,4,-3,2,-5,2,-5,-2,-5] },
    '9': { width: 13, points: [-3,5,2,5,2,5,4,3,4,3,4,-3,4,-3,2,-5,2,-5,-2,-5,-2,-5,-4,-3,-4,-3,-4,-2,-4,-2,-2,0,-2,0,3,0] }
};

XMaps.imageBaseUrl = "http://www.google.com/mapfiles/";

XMaps.getRotationParameters = function(from, to, autoRotate, autoRotateAngle, outRotationParameters) {
    outRotationParameters = outRotationParameters || {};

    var radians = Math.atan2(to.y - from.y, to.x - from.x);
    if (autoRotate) {
        if (typeof autoRotateAngle == 'undefined') {
            autoRotateAngle = outRotationParameters.autoRotateAngle || new XAngle();
            autoRotateAngle.value = 0;
            autoRotateAngle.units = XAngle.RAD;

            while (radians < -Math.PI / 2) {
                radians += Math.PI;
                autoRotateAngle.value = Math.PI
            }
            while (radians > Math.PI / 2) {
                radians -= Math.PI;
                autoRotateAngle.value = -Math.PI
            }
        } else {
            radians += XAngle.resolveToRadians(autoRotateAngle);
        }
    }
    var sin = Math.sin(radians);
    var cos = Math.cos(radians);

    outRotationParameters.cos = cos;
    outRotationParameters.sin = sin;
    outRotationParameters.angle = outRotationParameters.angle || new XAngle(radians, XAngle.RAD);
    outRotationParameters.autoRotateAngle = autoRotateAngle;
    return outRotationParameters;
};

XMaps.model = XModel.earth;

XMaps.combineStyles = function(overridingStyle, baseStyle, outStyle) {
    outStyle = outStyle || {};

    if (baseStyle) {
        for (key in baseStyle) {
            outStyle[key] = baseStyle[key]
        }
    }

    if (overridingStyle) {
        for (key in overridingStyle) {
            outStyle[key] = overridingStyle[key]
        }
    }

    return outStyle
}


// XImageFactory is pulled from the image factory code in http://maps.google.com/mapfiles/maps.16.js

function XImageFactory() {}

XImageFactory.create = function(src, width, height, left, top, zIndex, crop,
        className, doc, elementFactoryMethod) {

    var element;
    doc = doc || document;
    if (!elementFactoryMethod) {
        element = doc.createElement("img");
        if (src) { element.src = src }
    } else {
        element = elementFactoryMethod(src, crop, doc)
    }
    if (width && height) {
        element.style.width = XMaps.toPixelString(width);
        element.style.height = XMaps.toPixelString(height);
        element.width = width;
        element.height = height
    }
    if (top || (left || (top == 0 || left == 0))) {
        element.style.position = "absolute";
        element.style.left = XMaps.toPixelString(left);
        element.style.top = XMaps.toPixelString(top)
    }
    if (zIndex || zIndex == 0) {
        element.style.zIndex = zIndex
    }
    if (XMaps.userAgent.type == XUserAgent.IE) {
        element.unselectable = "on";
        element.onselectstart = XMaps.falseFunction
    } else {
        element.style.MozUserSelect = "none"
    }
    if (XMaps.userAgent.type == XUserAgent.IE) {
        element.galleryImg = "no"
    }
    element.style.border = "0";
    element.style.padding = "0";
    element.style.margin = "0";
    element.oncontextmenu = XMaps.falseFunction;
    if (className) {
        XMaps.addClassName(element, className)
    }

    return element
}


// XPngImageFactory is my best guess as to what this extension of XImageFactory
// should be called. This code is pulled from the image factory code in
// http://maps.google.com/mapfiles/maps.14.js

function XPngImageFactory() {}

XPngImageFactory.create = function(src, width, height, left, top, zIndex, crop,
        className, doc) {

    return XImageFactory.create(src, width, height, left, top, zIndex, crop,
            className, doc, XPngImageFactory.createElement)
}

XPngImageFactory.createElement = function(src, crop, doc) {
    if (typeof arguments.callee.hasFilters == "undefined") {
        var testElement = doc.createElement("div");
        arguments.callee.hasFilters = typeof testElement.style.filter != "undefined"
    }
    var element;
    if (arguments.callee.hasFilters) {
        var cache = doc.PNG_cache;
        if (cache && cache.childNodes.length > 0) {
            element = cache.removeChild(cache.lastChild)
        } else {
            element = doc.createElement("div");
            element.loader = doc.createElement("img");
            element.loader.style.visibility = "hidden";
            element.loader.onload = function() {
                element.style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="' + element.loader.src + '"' + element.loader.sizingMethod + ")"
            };
            XPngImageFactory.destroyBeforeUnload(element)
        }
    } else {
        element = doc.createElement("img")
    }
    XPngImageFactory.setImage(element, src, crop);
    return element
}

XPngImageFactory.remove = function(element, doc) {
    if (element.nodeName == "DIV") {
        if (!doc.PNG_cache) {
            doc.PNG_cache = doc.createElement("div");
            doc.PNG_cache.style.display = "none";
            doc.body.appendChild(doc.PNG_cache)
        }
        doc.PNG_cache.appendChild(element);
        XPngImageFactory.clearImage(element)
    } else {
        element.parentNode.removeChild(element)
    }
}

XPngImageFactory.setImage = function(element, src, crop) {
    if (element.tagName == "DIV") {
        element.loader.sizingMethod = crop ? ",sizingMethod=crop" : "";
        element.loader.src = src
    } else {
        element.src = src
    }
}

XPngImageFactory.clearImage = function(element, src) {
    if (element.tagName == "DIV") {
        element.style.filter = ""
    } else {
        element.src = src
    }
}

XPngImageFactory.destroyBeforeUnload = function(element) {
    if (!XPngImageFactory.cleanupQueue) {
        XPngImageFactory.cleanupQueue = [];
        GEvent.addBuiltInListener(window, "beforeunload", XPngImageFactory.onBeforeUnload)
    }
    XPngImageFactory.cleanupQueue.push(element)
}

XPngImageFactory.onBeforeUnload = function() {
    for (var i = 0; i < XPngImageFactory.cleanupQueue.length; ++i) {
        XPngImageFactory.destroyImage(XPngImageFactory.cleanupQueue[i])
    }
}

XPngImageFactory.destroyImage = function(element) {
    if (element.loader) {
        element.loader.onload = null;
        element.loader = null
    }
}


// Extensions to GBounds

GBounds.CONTAINS = 0;
GBounds.INTERSECTS = 1;
GBounds.DISJOINT_WITH = 2;

GBounds.createMinBounds = function() {
    return new GBounds(Number.MAX_VALUE, Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
}

GBounds.createMaxBounds = function() {
    return new GBounds(-Number.MAX_VALUE, -Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
}

GBounds.getHorizSegmentIntersection = function(from, to, minX, maxX, y) {
   var x;
   if (from.y > y && to.y < y) {
       x = to.x + (y - to.y) / (from.y - to.y) * (from.x - to.x);
   }
   if (from.y < y && to.y > y) {
       x = from.x + (y - from.y) / (to.y - from.y) * (to.x - from.x);
   }
   if (x >= minX && x <= maxX) { return x } else { return null }
}

GBounds.getVertSegmentIntersection = function(from, to, x, minY, maxY) {
   var y;
   if (from.x > x && to.x < x) {
       y = to.y + (x - to.x) / (from.x - to.x) * (from.y - to.y);
   }
   if (from.x < x && to.x > x) {
       y = from.y + (x - from.x) / (to.x - from.x) * (to.y - from.y);
   }
   if (y >= minY && y <= maxY) { return y } else { return null }
}

GBounds.prototype.surroundsSegment = function(from, to) {
    return (from.x > this.minX && to.x > this.minX &&
            from.x < this.maxX && to.x < this.maxX &&
            from.y > this.minY && to.y > this.minY &&
            from.y < this.maxY && to.y < this.maxY)
}

GBounds.prototype.segmentIntersection = function(from, to, outFrom, outTo) {
    outFrom = outFrom || new GPoint();
    outTo = outTo || new GPoint();

    outFrom.x = from.x;
    outFrom.y = from.y;
    outTo.x = to.x;
    outTo.y = to.y;

    if (this.surroundsSegment(from, to)) { return GBounds.CONTAINS }

    var top = GBounds.getHorizSegmentIntersection(from, to, this.minX, this.maxX, this.minY);
    var bot = GBounds.getHorizSegmentIntersection(from, to, this.minX, this.maxX, this.maxY);
    var left = GBounds.getVertSegmentIntersection(from, to, this.minX, this.minY, this.maxY);
    var right = GBounds.getVertSegmentIntersection(from, to, this.maxX, this.minY, this.maxY);

    if (!(top || bot || left || right)) { return GBounds.DISJOINT_WITH }

    if (top && (from.y <= this.minY)) {
        outFrom.x = top; outFrom.y = this.minY;
    } else if (left && (from.x <= this.minX)) {
        outFrom.x = this.minX; outFrom.y = left;
    } else if (right && (from.x >= this.maxX)) {
        outFrom.x = this.maxX; outFrom.y = right;
    } else if (bot && (from.y >= this.maxY)) {
        outFrom.x = bot; outFrom.y = this.maxY;
    }

    if (top && (to.y <= this.minY)) {
        outTo.x = top; outTo.y = this.minY;
    } else if (left && (to.x <= this.minX)) {
        outTo.x = this.minX; outTo.y = left;
    } else if (right && (to.x >= this.maxX)) {
        outTo.x = this.maxX; outTo.y = right;
    } else if (bot && (to.y >= this.maxY)) {
        outTo.x = bot; outTo.y = this.maxY;
    }

    return GBounds.INTERSECTS;
}


// GMap extension to allow for multiple overlays to be added at once. This will
// improve the speed at which you can add overlays since the reordering of all
// overlays now happens once instead of n times.

GMap.prototype.addOverlays = function(overlays) {
    var _this = this;
    for (var i = 0; i < overlays.length; i++) {
        var overlay = overlays[i];
        this.overlays.push(overlay);
        overlay.initialize(this);
        overlay.redraw(true);
        GEvent.bind(overlay, "click", overlay, function() { GEvent.trigger(_this, "click", this) });
    }
    this.reOrderOverlays();
}

GMap.prototype.reOrderOverlays = function() {
    this.overlays.sort(GMap.orderOverlays);
    var zIndices = [];
    for (var i = 0; i < this.overlays.length; i++) {
        var offset = i << 4;
        zIndices[0] = 10000 + offset;
        zIndices[2] = 15000;
        zIndices[1] = 20000 + offset;
        zIndices[3] = 25000 + offset;
        zIndices[5] = 30000;
        zIndices[4] = 35000 + offset;
        zIndices[6] = 45000 + offset;
        zIndices[7] = 50000 + offset;
        this.overlays[i].setZIndex(zIndices)
    }
}


// XIconShape is a class for creating the shape paths used by XIcon

XIconShape.cache = {};

XIconShape.get = function(scale, outlineWeight, shapeName) {
    var id = scale + ',' + outlineWeight + ',' + shapeName;
    var shape;

    if (XIconShape.cache[id]) {
        shape = XIconShape.cache[id];
    } else {
        shape = new XIconShape(scale, outlineWeight, shapeName);
        XIconShape.cache[id] = shape;
    }

    return shape;
}

function XIconShape(scale, outlineWeight, shapeName) {
    this.scale = scale;
    this.outlineWeight = outlineWeight;
    var shape = XIcon.shapes[shapeName];

    var points = [];
    for (var i = 0; i < shape.points.length; i++) {
        points[i] = Math.round(shape.points[i] * scale) + outlineWeight;
    }

    var vectors = [];

    var bounds = GBounds.createMinBounds();

    for (var i = 0; i < points.length - 2; i += 2) {
        vectors.push(points[i]);
        vectors.push(points[i + 1]);
        vectors.push(points[i + 2]);
        vectors.push(points[i + 3]);
        bounds.extend({ x: points[i], y: points[i + 1] });
    }
    vectors.push(points[points.length - 2]);
    vectors.push(points[points.length - 1]);
    vectors.push(points[0]);
    vectors.push(points[1]);
    bounds.extend({ x: points[points.length - 2], y: points[points.length - 1] });

    var offs = outlineWeight;
    var outlinePath = this.getEncodedImageSource(vectors, 0, 0);//-offs, -offs);
    var fillVectors = this.getFillPath(points, bounds, 1);
    var fillPath = this.getEncodedImageSource(fillVectors, 0, 0);//-offs, -offs);
    var shadowPath = null;
    var shadowWeight;
    if (shape.shadow) {
        var anchor = new GPoint(Math.round(shape.iconAnchor.x * scale), Math.round(shape.iconAnchor.y * scale));
        var shadowVectors;
        if (shape.isComplex) {
            shadowVectors = this.getComplexShadowPath(points, bounds, 1, anchor);
            shadowWeight = 1;
        } else {
            shadowVectors = this.getSimpleShadowPath(points, bounds, outlineWeight, anchor);
            shadowWeight = outlineWeight;
        }
        var vertOffs = Math.round(anchor.y / 2);
        shadowPath = this.getEncodedImageSource(shadowVectors, 0, -vertOffs);//-offs, -offs);
    }

    var iconAnchor = this.fixPoint(shape.iconAnchor);
    var infoWindowAnchor = this.fixPoint(shape.infoWindowAnchor);
    var contentAnchor;
    var contentSize;
    if (shape.contentAnchor) {
        contentAnchor = this.fixPoint(shape.contentAnchor);
        contentSize = new GSize(
                Math.round(shape.contentSize.width * this.scale),
                Math.round(shape.contentSize.height * this.scale));
    }

    var icon = {
        bounds: bounds,
        offs: offs,
        outlinePath: outlinePath,
        fillPath: fillPath,
        shadowPath: shadowPath,
        imageMap: points,
        iconAnchor: iconAnchor,
        infoWindowAnchor: infoWindowAnchor,
        shadowWeight: shadowWeight,
        contentAnchor: contentAnchor,
        contentSize: contentSize
    };

    return icon
}

XIconShape.prototype.fixPoint = function(pointIn, pointOut) {
    pointOut = pointOut || new GPoint();
    pointOut.x = Math.round(pointIn.x * this.scale) + this.outlineWeight;
    pointOut.y = Math.round(pointIn.y * this.scale) + this.outlineWeight;
    return pointOut
}

XIconShape.prototype.getEncodedImageSource = GPolyline.prototype.getEncodedImageSource;
XIconShape.prototype.encodeSigned = GPolyline.prototype.encodeSigned;
XIconShape.prototype.encodeUnsigned = GPolyline.prototype.encodeUnsigned;

XIconShape.prototype.getFillPath = function(points, bounds, weight) {
    var vectors = [];
    var pointCount = points.length;

    var x1, y1;
    var x2, y2;
    for (var y = bounds.minY; y <= bounds.maxY; y += weight) {
        var xCoords = [];
        var intersectionCount = 0;
        var index1, index2;

        for (var i = 0; i < pointCount >> 1; i++) {
            if (i) {
                index1 = (i - 1) << 1;
                index2 = i << 1;
            } else {
                index1 = ((pointCount >> 1) - 1) << 1;
                index2 = 0;
            }

            y1 = points[index1 + 1];
            y2 = points[index2 + 1];

            if (y1 < y2) {
                x1 = points[index1];
                x2 = points[index2];
            } else if (y1 > y2) {
                x2 = points[index1];
                x1 = points[index2];
                y2 = points[index1 + 1];
                y1 = points[index2 + 1];
            } else {
                continue;
            }

            if ((y >= y1) && (y < y2) || ((y == bounds.maxY) && (y > y1) && (y <= y2))) {
                xCoords[intersectionCount++] = Math.round((y - y1) * (x2 - x1) / (y2 - y1) + x1);
            }
        }

        xCoords.sort(XMaps.integerCompare);

        for (var i = 0; i < (intersectionCount >> 1) << 1; i += 2) {
            x1 = xCoords[i] + 1;
            x2 = xCoords[i + 1];
            if (x1 <= x2) {
                vectors.push(x1);
                vectors.push(y);
                vectors.push(x2);
                vectors.push(y);
            }
        }
    }

    return vectors;
}

XIconShape.prototype.getSimpleShadowPath = function(points, bounds, weight, anchor) {
    var vectors = [];
    var pointCount = points.length;

    var topLeft = 0;
    for (var i = 0; i < points.length; i += 2) {
        if (points[i + 1] < points[(topLeft << 1) + 1] ||
                (points[i + 1] == points[(topLeft << 1) + 1] &&
                 points[i] < points[topLeft << 1])) {

            topLeft = (i >> 1);
        }
    }

    for (var i = (topLeft << 1); i < points.length - 2; i += 2) {
        x = points[i];
        y = points[i + 1];
        vectors.push(x + Math.round((anchor.y - y) * 2 / 3));
        vectors.push(Math.round(y * 0.5));
        x = points[i + 2];
        y = points[i + 3];
        vectors.push(x + Math.round((anchor.y - y) * 2 / 3));
        vectors.push(Math.round(y * 0.5));
    }
    x = points[points.length - 2];
    y = points[points.length - 1];
    vectors.push(x + Math.round((anchor.y - y) * 2 / 3));
    vectors.push(Math.round(y * 0.5));
    x = points[0];
    y = points[1];
    vectors.push(x + Math.round((anchor.y - y) * 2 / 3));
    vectors.push(Math.round(y * 0.5));
    for (var i = 0; i < (topLeft << 1); i += 2) {
        x = points[i];
        y = points[i + 1];
        vectors.push(x + Math.round((anchor.y - y) * 2 / 3));
        vectors.push(Math.round(y * 0.5));
        x = points[i + 2];
        y = points[i + 3];
        vectors.push(x + Math.round((anchor.y - y) * 2 / 3));
        vectors.push(Math.round(y * 0.5));
    }

    x = points[topLeft << 1];
    y = points[(topLeft << 1) + 1];
    vectors.push(x + Math.round((anchor.y - y) * 2 / 3));
    vectors.push(Math.round(y * 0.5));

    var x1, y1;
    var x2, y2;
    for (var y = bounds.minY; y <= bounds.maxY; y += 1) {
        var xCoords = [];
        var intersectionCount = 0;
        var index1, index2;

        for (var i = 0; i < pointCount >> 1; i++) {
            if (i) {
                index1 = (i - 1) << 1;
                index2 = i << 1;
            } else {
                index1 = ((pointCount >> 1) - 1) << 1;
                index2 = 0;
            }

            y1 = points[index1 + 1] * 0.5;
            y2 = points[index2 + 1] * 0.5;

            if (y1 < y2) {
                x1 = points[index1];
                x1 += (anchor.y - y1 * 2) * 2 / 3;
                x2 = points[index2];
                x2 += (anchor.y - y2 * 2) * 2 / 3;
            } else if (y1 > y2) {
                y2 = points[index1 + 1] * 0.5;
                y1 = points[index2 + 1] * 0.5;
                x2 = points[index1];
                x2 += (anchor.y - y2 * 2) * 2 / 3;
                x1 = points[index2];
                x1 += (anchor.y - y1 * 2) * 2 / 3;
            } else {
                continue;
            }

            if ((y >= y1) && (y < y2) || ((y == bounds.maxY) && (y > y1) && (y <= y2))) {
                xCoords[intersectionCount++] = Math.round((y - y1) * (x2 - x1) / (y2 - y1) + x1);
            }
        }

        xCoords.sort(XMaps.integerCompare);

        for (var i = 0; i < (intersectionCount >> 1) << 1; i += 2) {
            x1 = xCoords[i];
            x2 = xCoords[i + 1];
            vectors.push(x1);
            vectors.push(y);
            vectors.push(x1);
            vectors.push(y);
            vectors.push(x2);
            vectors.push(y);
            vectors.push(x2);
            vectors.push(y);
        }
    }

    vectors.push(vectors[vectors.length - 2]);
    vectors.push(vectors[vectors.length - 2]);

    return vectors;
}

XIconShape.prototype.getComplexShadowPath = function(points, bounds, weight, anchor) {
    var vectors = [];
    var pointCount = points.length;

    var x1, y1;
    var x2, y2;
    for (var y = bounds.minY; y <= bounds.maxY; y += weight) {
        var xCoords = [];
        var intersectionCount = 0;
        var index1, index2;

        for (var i = 0; i < pointCount >> 1; i++) {
            if (i) {
                index1 = (i - 1) << 1;
                index2 = i << 1;
            } else {
                index1 = ((pointCount >> 1) - 1) << 1;
                index2 = 0;
            }

            y1 = points[index1 + 1] * 0.5;
            y2 = points[index2 + 1] * 0.5;

            if (y1 < y2) {
                x1 = points[index1];
                x1 += (anchor.y - y1 * 2) * 2 / 3;
                x2 = points[index2];
                x2 += (anchor.y - y2 * 2) * 2 / 3;
            } else if (y1 > y2) {
                y2 = points[index1 + 1] * 0.5;
                y1 = points[index2 + 1] * 0.5;
                x2 = points[index1];
                x2 += (anchor.y - y2 * 2) * 2 / 3;
                x1 = points[index2];
                x1 += (anchor.y - y1 * 2) * 2 / 3;
            } else {
                continue;
            }

            if ((y >= y1) && (y < y2) || ((y == bounds.maxY) && (y > y1) && (y <= y2))) {
                xCoords[intersectionCount++] = Math.round((y - y1) * (x2 - x1) / (y2 - y1) + x1);
            }
        }

        xCoords.sort(XMaps.integerCompare);

        for (var i = 0; i < (intersectionCount >> 1) << 1; i += 2) {
            x1 = xCoords[i];
            x2 = xCoords[i + 1];
            vectors.push(x1);
            vectors.push(y);
            vectors.push(x2);
            vectors.push(y);
        }
    }

    return vectors;
}


// XIcon is a class for creating colored markers.

XIcon.shapes = {
    'default': {
        iconAnchor: new GPoint(9, 34),
        infoWindowAnchor: new GPoint(9, 2),
        shadow: true,
        contentAnchor: new GPoint(0, 0),
        contentSize: new GSize(19, 19),
        points: [9,0,6,1,4,2,2,4,0,8,0,12,1,14,2,16,5,19,7,23,8,26,9,30,9,33,10,33,10,30,11,26,12,23,14,19,17,16,18,14,19,12,19,8,17,4,15,2,13,1,10,0]
    },
    'rounded-box': {
        iconAnchor: new GPoint(15, 34),
        infoWindowAnchor: new GPoint(15, 0),
        shadow: true,
        contentAnchor: new GPoint(0, 0),
        contentSize: new GSize(30, 25),
        points: [15,0,4,0,2,1,1,2,0,4,0,20,1,22,2,23,4,24,10,24,11,25,15,34,19,25,20,24,26,24,28,23,29,22,30,20,30,4,29,2,28,1,26,0]
    },
    'left-top-box': {
        iconAnchor: new GPoint(34, 30),
        infoWindowAnchor: new GPoint(34, 30),
        shadow: true,
        contentAnchor: new GPoint(0, 0),
        contentSize: new GSize(30, 26),
        points: [0,0,0,25,25,25,34,30,29,21,29,0]
    },
    'right-top-box': {
        iconAnchor: new GPoint(0, 30),
        infoWindowAnchor: new GPoint(0, 30),
        shadow: true,
        contentAnchor: new GPoint(5, 0),
        contentSize: new GSize(30, 26),
        points: [0,30,9,25,34,25,34,0,5,0,5,21]
    },
    'circle': {
        iconAnchor: new GPoint(16, 16),
        infoWindowAnchor: new GPoint(16, 16),
        shadow: false,
        contentAnchor: new GPoint(0, 0),
        contentSize: new GSize(33, 33),
        points: [16,0,12,1,9,2,7,3,6,4,4,6,3,7,2,9,1,12,0,16,1,20,2,23,3,25,4,26,6,28,7,29,9,30,12,31,16,32,20,31,23,30,25,29,26,28,28,26,29,25,30,23,31,20,32,16,31,12,30,9,29,7,28,6,26,4,25,3,23,2,20,1]
    }
};

XIcon.defaultStyle = {
    scale: 1,
    outlineColor: '#000000',
    outlineWeight: 1,
    fillColor: '#ff776b',
    fillOpacity: 1
};

function XIcon(shapeName, style) {
    shapeName = shapeName || 'default';

    style = style || {};
    for (var key in XIcon.defaultStyle) {
        this[key] = style[key] || XIcon.defaultStyle[key]
    }

    var shape = XIconShape.get(this.scale, this.outlineWeight, shapeName);
    for (var key in XIconShape.cache) {
        XDebug.write(key);
    }

    var color = XMaps.parseColor(this.outlineColor);
    var alpha = 0;
    var width = shape.bounds.maxX + shape.offs * 2;
    var height = shape.bounds.maxY + shape.offs * 2;
    var outlineSrc = "http://www.google.com/maplinedraw?width=" + width +
            "&height=" + height + "&path=" + shape.outlinePath + "&color=" + color.red +
            "," + color.green + "," + color.blue + "," + alpha + "&weight=" + this.outlineWeight;

    color = XMaps.parseColor(this.fillColor);
    alpha = (1 - this.fillOpacity) * 255;
    width = shape.bounds.maxX + shape.offs * 2;
    height = shape.bounds.maxY + shape.offs * 2;
    var fillSrc = "http://www.google.com/maplinedraw?width=" + width +
            "&height=" + height + "&path=" + shape.fillPath + "&color=" + color.red +
            "," + color.green + "," + color.blue + "," + alpha + "&weight=" + 1;

    var transparentSrc = "http://www.google.com/maplinedraw?width=" + width +
            "&height=" + height + "&path=" + shape.fillPath + "&color=0,0,0,254" + "&weight=" + 1;

    var shadowSrc = XMaps.imageBaseUrl + "markerTransparent.png";
    var shadowSize = new GSize(1, 1);
    if (shape.shadowPath) {
        color = XMaps.parseColor('#000000');
        alpha = (1 - 0.25) * 255;
        shadowSrc = "http://www.google.com/maplinedraw?width=" + (width * 2) +
                "&height=" + height + "&path=" + shape.shadowPath + "&color=" + color.red +
                "," + color.green + "," + color.blue + "," + alpha + "&weight=" + shape.shadowWeight;
        shadowSize.width = width * 2;
        shadowSize.height = height;
    }

    var icon = new GIcon({
        image: fillSrc,
        shadow: shadowSrc,
        iconSize: new GSize(width, height),
        shadowSize: shadowSize,
        iconAnchor: shape.iconAnchor,
        infoWindowAnchor: shape.infoWindowAnchor,
        transparent: transparentSrc,
        imageMap: shape.imageMap
    });
    icon.images = [outlineSrc];
    icon.contentAnchor = shape.contentAnchor;
    icon.contentSize = shape.contentSize;
    return icon;
};


// XMarker is an extension of GMarker for arbitrary layers to be displayed.
// A stripped-down version of the default marker icon is provided (with no
// support for printing).

XMarker.prototype = new GMarker();
XMarker.prototype.constructor = XMarker;

XMarker.defaultIcon = new GIcon({
    image: XMaps.imageBaseUrl + "marker.png",
    shadow: XMaps.imageBaseUrl + "shadow50.png",
    iconSize: new GSize(20, 34),
    shadowSize: new GSize(37, 34),
    iconAnchor: new GPoint(9, 34),
    infoWindowAnchor: new GPoint(9, 2),
    infoShadowAnchor: new GPoint(18, 25),
    transparent: XMaps.imageBaseUrl + "markerTransparent.png",
    imageMap: [9,0,6,1,4,2,2,4,0,8,0,12,1,14,2,16,5,19,7,23,8,26,9,30,9,34,11,34,11,30,12,26,13,24,14,21,16,18,18,16,20,12,20,8,18,4,16,2,15,1,13,0]
});

XMarker.defaultPrintableIcon = XMarker.prototype.icon;

// TODO: dehackify the no icon case.
XMarker.noIcon = new GIcon({
    image: XMaps.imageBaseUrl + "markerTransparent.png",
    shadow: XMaps.imageBaseUrl + "markerTransparent.png",
    iconSize: new GSize(20, 34),
    shadowSize: new GSize(20, 34),
    iconAnchor: new GPoint(0, 0),
    infoWindowAnchor: new GPoint(9, 2),
    infoShadowAnchor: new GPoint(18, 25)
});

function XMarker(point, icon, iconContent, hoverContent, infoWindowContent) {
    this.point = point;
    this.icon = icon || XMarker.defaultIcon;
    this.iconContent = iconContent;
    this.hoverContent = hoverContent;
    this.infoWindowContent = infoWindowContent;
};

XMarker.prototype.onMouseOver = function() {
    this.mouseOver = true;
    this.displayHover(true);

    GEvent.trigger(this, "mouseover")
}

XMarker.prototype.onMouseOut = function() {
    this.mouseOver = false;
    this.displayHover(false);

    GEvent.trigger(this, "mouseout")
}

XMarker.prototype._initialize = XMarker.prototype.initialize;
XMarker.prototype.initialize = function(map) {
    this._initialize(map);

    var icon = this.icon;
    this.iconImages = [];
    if (icon.images) {
        for (var i = 0; i < icon.images.length; i++) {
            var image = XPngImageFactory.create(icon.images[i], icon.iconSize.width, icon.iconSize.height, 0, 0, null, false, icon.printImage ? "noprint" : null, map.ownerDocument);
            this.iconImages.push(image);
            this.images.push(image);
            this.map.div.appendChild(image)
        }
    }

    if (this.iconContent) {
        this.initializeIconContentElement();
        if (this.icon.contentAnchor) {
            var doc = this.map.ownerDocument;
            var td = doc.createElement('td');
            var tr = doc.createElement('tr');
            var tbody = doc.createElement('tbody');
            var table = doc.createElement('table');
            table.style.border = '0';
            table.style.borderCollapse = 'collapse';
            table.style.width = XMaps.toPixelString(this.icon.contentSize.width);
            table.style.height = XMaps.toPixelString(this.icon.contentSize.height);
            td.style.textAlign = 'center';
            td.style.verticalAlign = 'middle';
            td.style.border = '0';
            td.style.borderSpacing = '0';

            // TODO: dehackify the sizing of the text
//            var minDim = 18;
//            if (this.icon.contentSize.height < minDim || this.icon.contentSize.width < minDim) {
//                td.style.fontSize = XMaps.toPixelString(12 - (minDim - Math.min(this.icon.contentSize.width, this.icon.contentSize.height)) - 2);
//            }

            this.iconContentElement.margin = '0 auto';
            this.iconContentElement.position = 'relative';

            this.map.div.appendChild(table);
            table.appendChild(tbody);
            tbody.appendChild(tr);
            tr.appendChild(td);
            td.appendChild(this.iconContentElement);

            this.iconContentElement = table;
        } else {
            this.map.div.appendChild(this.iconContentElement)
        }
    }

    if (this.hoverContent) {
        if (this.imageMap) {
            this.hoverElement = this.imageMap.firstChild
        } else {
            this.hoverElement = this.transparentIcon || this.iconImage
        }

        // TODO: figure out why the bind call doesn't work
        //GEvent.bindDom(this.hoverElement, "onmouseover", this, this.onMouseOver);
        //GEvent.bindDom(this.hoverElement, "onmouseout", this, this.onMouseOut);
        var _this = this;
        this.hoverElement.onmouseover = function() { _this.onMouseOver() };
        this.hoverElement.onmouseout = function() { _this.onMouseOut() };

        this.initializeHoverContentElement();
        this.map.div.appendChild(this.hoverContentElement);
        this.displayHover(false);
    }

    if (this.infoWindowContent) {
        GEvent.bind(this, "click", this, this.displayInfoWindowContent);
    }
}

XMarker.prototype.initializeIconContentElement = function() {
    if (typeof this.iconContent == 'string') {
        this.iconContentElement = this.map.ownerDocument.createElement('div');
        this.iconContentElement.innerHTML = this.iconContent;
        this.iconContentElement.style.fontFamily = "verdana, sans-serif";
        this.iconContentElement.style.fontWeight = "bold";
    } else if (typeof this.iconContent == 'object') {
        this.iconContentElement = this.iconContent;
    } else if (typeof this.iconContent == 'function') {
        this.initializeIconContentElement(this.iconContent(this));
    }
}

XMarker.prototype.initializeHoverContentElement = function() {
    if (typeof this.hoverContent == 'string') {
        this.hoverContentElement = this.map.ownerDocument.createElement('div');
        this.hoverContentElement.innerHTML = this.hoverContent;
        this.hoverContentElement.style.backgroundColor = 'white';
        this.hoverContentElement.style.textAlign = "left";
        this.hoverContentElement.style.fontFamily = "verdana, sans-serif";
        this.hoverContentElement.style.fontWeight = "bold";
        this.hoverContentElement.style.padding = '5px';
        this.hoverContentElement.style.border = '2px solid #000';

        var opacity = 0.75;
        if (XMaps.userAgent.type == XUserAgent.IE) {
            this.hoverContentElement.style.filter = 'alpha(opacity:' + (opacity * 100) + ')';
        }
        if (XMaps.userAgent.type == XUserAgent.MOZILLA) {
            this.hoverContentElement.style.MozOpacity = opacity;
        }
    } else if (typeof this.hoverContent == 'object') {
        this.hoverContentElement = this.hoverContent;
    } else if (typeof this.hoverContent == 'function') {
        this.initializeHoverContentElement(this.hoverContent(this));
    }
}

XMarker.prototype.displayInfoWindowContent = function() {
    if (typeof this.infoWindowContent == 'string') {
        this.openInfoWindowHtml(this.infoWindowContent);
    } else if (typeof this.infoWindowContent == 'object') {
        this.openInfoWindow(this.infoWindowContent);
    } else if (typeof this.infoWindowContent == 'function') {
        this.displayInfoWindowContent(this.infoWindowContent(this));
    }
}

XMarker.prototype.displayHover = function(visible) {
    if (this.hoverContentElement) {
        this.hoverContentElement.style.display = visible ? (this.mouseOver ? "" : "none") : "none";
    }
}

XMarker.prototype._remove = XMarker.prototype.remove;
XMarker.prototype.remove = function() {
    this._remove();

    if (this.iconContentElement) {
        this.map.div.removeChild(this.iconContentElement)
    }

    if (this.hoverContentElement) {
        this.map.div.removeChild(this.hoverContentElement)
    }
}

XMarker.prototype.copy = function() {
    return new XMarker(this.point, this.icon, this.iconContent, this.hoverContent, this.infoWindowContent)
}

XMarker.prototype._redraw = XMarker.prototype.redraw;
XMarker.prototype.redraw = function(force) {
    this._redraw(force);

    if (!force) { return }

    var bitmapCoord = this.map.spec.getBitmapCoordinate(this.point.y, this.point.x, this.map.zoomLevel);
    var divCoord = this.map.getDivCoordinate(bitmapCoord.x, bitmapCoord.y);
    var left = divCoord.x - this.icon.iconAnchor.x;
    var top = divCoord.y - this.icon.iconAnchor.y;

    if (this.iconContentElement) {
        this.iconContentElement.style.position = "absolute";
        if (this.icon.contentAnchor) {
            this.iconContentElement.style.left = XMaps.toPixelString(left + this.icon.contentAnchor.x);
            this.iconContentElement.style.top = XMaps.toPixelString(top + this.icon.contentAnchor.y);
        } else {
            this.iconContentElement.style.left = XMaps.toPixelString(left);
            this.iconContentElement.style.top = XMaps.toPixelString(top);
        }
    }

    if (this.hoverContentElement) {
        this.hoverContentElement.style.position = "absolute";
        this.hoverContentElement.style.left = XMaps.toPixelString(left + this.icon.iconSize.width + 10);
        this.hoverContentElement.style.top = XMaps.toPixelString(top);
    }
}

XMarker.prototype._setZIndex = XMarker.prototype.setZIndex;
XMarker.prototype.setZIndex = function(zIndices) {
    this._setZIndex(zIndices);

    var index = zIndices[3] + 1;

    for (var i = 0; i < this.iconImages.length; i++) {
        this.iconImages[i].style.zIndex = index++;
    }

    if (this.iconContentElement) {
        this.iconContentElement.style.zIndex = index++;

        if (XMaps.userAgent.type == XUserAgent.IE) {
            this.iconContentElement.unselectable = "on";
            this.iconContentElement.onselectstart = XMaps.falseFunction
        } else {
            this.iconContentElement.style.MozUserSelect = "none"
        }
    }

    if (this.hoverContentElement) {
        this.hoverContentElement.style.zIndex = 99999;

        if (XMaps.userAgent.type == XUserAgent.IE) {
            this.hoverContentElement.unselectable = "on";
            this.hoverContentElement.onselectstart = XMaps.falseFunction
        } else {
            this.hoverContentElement.style.MozUserSelect = "none"
        }
    }
}

XMarker.prototype._display = XMarker.prototype.display;
XMarker.prototype.display = function(visible) {
    this._display(visible);

    if (this.iconContentElement) {
        this.iconContentElement.style.display = visible ? "" : "none";
    }

    this.displayHover(visible);
}


// XArrowShape is a helper class for XArrow that creates the path for the arrow image.

XArrowShape.cache = [];

XArrowShape.get = function(angle, size, weight) {
    var radians = XAngle.resolveToRadians(angle);
    var degrees = XAngle.radiansToDegrees(radians);

    var id = Math.round(degrees) + ',' + size + ',' + weight;
    var shape;

    if (XArrowShape.cache[id]) {
        shape = XArrowShape.cache[id];
    } else {
        shape = new XArrowShape(radians, size, weight);
        XArrowShape.cache[id] = shape;
    }

    return shape;
}

function XArrowShape(radians, size, weight) {
    var points = [];
    var vectors = [0, 0];

    for (var i = 0; i < 3; i++) {
        points[i] = new GPoint(size * Math.cos(radians + i * 2 * Math.PI / 3),
                size * Math.sin(radians + i * 2 * Math.PI / 3));
        vectors.push(Math.round(points[i].x));
        vectors.push(Math.round(points[i].y));
        vectors.push(Math.round(points[i].x));
        vectors.push(Math.round(points[i].y));
    }
    vectors.push(Math.round(points[0].x));
    vectors.push(Math.round(points[0].y));
    vectors.push(Math.round(points[0].x));
    vectors.push(Math.round(points[0].y));

    points.sort(XArrowShape.pointCompare);

    var x1, x2;
    var y = Math.ceil(points[0].y);

    for (var i = 0; i < 2; i++) {
        for (; y <= Math.floor(points[i + 1].y); y += weight) {
            if (points[i].y == points[i + 1].y) {
                x1 = Math.round(points[i].x);
                x2 = Math.round(points[i + 1].x);
            } else {
                if (points[i + 1].y == points[0].y || points[2].y == points[i].y) { continue }
                x1 = Math.round((y - points[0].y) * (points[i + 1].x - points[0].x) / (points[i + 1].y - points[0].y) + points[0].x);
                x2 = Math.round((y - points[i].y) * (points[2].x - points[i].x) / (points[2].y - points[i].y) + points[i].x);
            }
            if (x1 > x2) {
                var temp = x1;
                x1 = x2;
                x2 = temp
            }
            if (x2 - x1 > 1) {
                vectors.push(x1);
                vectors.push(y);
                vectors.push(x1);
                vectors.push(y);
                vectors.push(x2);
                vectors.push(y);
                vectors.push(x2);
                vectors.push(y);
             }
        }
    }

    vectors.push(0);
    vectors.push(0);

    this.offs = size + (weight >> 1);
    this.path = this.getEncodedImageSource(vectors, -this.offs, -this.offs);
    this.anchor = new GPoint(this.offs + Math.round(Math.cos(radians) * this.offs), this.offs + Math.round(Math.sin(radians) * this.offs));
};

XArrowShape.prototype.getEncodedImageSource = GPolyline.prototype.getEncodedImageSource;
XArrowShape.prototype.encodeSigned = GPolyline.prototype.encodeSigned;
XArrowShape.prototype.encodeUnsigned = GPolyline.prototype.encodeUnsigned;

XArrowShape.pointCompare = function(a, b) {
    if (a.y < b.y) {
        return -1;
    } else if (a.y > b.y) {
        return 1;
    } else {
        return (a.x < b.x) ? -1 : ((a.x > b.x) * 1);
    }
}


// XArrow is a class for creating arrows that point in any direction, of any color.

XArrow.defaultColor = '#0000ff';
XArrow.defaultOpacity = 0.45;
XArrow.defaultWeight = 3;
XArrow.defaultSize = 10;

function XArrow(from, to, at, color, opacity, size, weight) {
    this.from = from;
    this.to = to;
    this.at = at;
    this.color = color || XArrow.defaultColor;
    this.opacity = opacity || XArrow.defaultOpacity;
    this.size = size || XArrow.defaultSize;
    this.weight = weight || XArrow.defaultWeight;
};

XArrow.prototype.initialize = function(map) {
    this.map = map;
    this.element = this.createElement();
    this.map.div.appendChild(this.element);
}

XArrow.prototype.remove = function() {
    if (this.element) {
        this.map.div.removeChild(this.element);
        this.element = null
    }
}

XArrow.prototype.copy = function() {
    var arrow = new XArrow(this.from, this.to, this.at, this.color, this.opacity);
    arrow.element = null;
    return arrow;
}

XArrow.prototype.redraw = function(force) {
    if (!force) { return }
    if (this.element) {
        this.remove();
    }
    this.element = this.createElement();
    this.map.div.appendChild(this.element);
}

XArrow.prototype.remove = function() {
    if (this.element) {
        this.map.div.removeChild(this.element);
        this.element = null
    }
}

XArrow.prototype.getLatitude = function() {
    return this.at.y
}

XArrow.prototype.setZIndex = function(zIndexes) {
    this.element.style.zIndex = zIndexes[0]
}

XArrow.prototype.display = function(visible) {
    this.element.style.display = visible ? "" : "none";
}

XArrow.prototype.createElement = function() {
    var arrow = XArrow.get(this.getRadians(), this.color, this.opacity);

    var bitmapCoord = this.map.spec.getBitmapCoordinate(this.at.y, this.at.x, this.map.zoomLevel);
    bitmapCoord.x -= (arrow.width >> 1) + this.size * Math.cos(this.getRadians());
    bitmapCoord.y -= (arrow.height >> 1) + this.size * Math.sin(this.getRadians());
    var divCoord = this.map.getDivCoordinate(bitmapCoord.x, bitmapCoord.y);

    if (XMaps.userAgent.type != XUserAgent.IE) {
        arrow.width = null;
        arrow.height = null
    }

    var className = XMaps.userAgent.type == XUserAgent.MOZILLA ? "noprint" : null;
    var drawElement = XPngImageFactory.create(arrow.src, arrow.width, arrow.height,
            divCoord.x, divCoord.y, 0, false, className);

    return drawElement
}

XArrow.prototype.getAngle = function() { return new XAngle(this.getRadians, XAngle.RAD) }

XArrow.prototype.getRadians = function() {
    var from = this.map.spec.getBitmapCoordinate(this.from.y, this.from.x, this.map.zoomLevel);
    var to = this.map.spec.getBitmapCoordinate(this.to.y, this.to.x, this.map.zoomLevel);
    var radians = Math.atan2(to.y - from.y, to.x - from.x);
    radians = XAngle.normalizeRadians(radians);

    return radians;
}

XArrow.get = function(angle, color, opacity, size, weight) {
    color = color || XArrow.defaultColor;
    opacity = opacity || XArrow.defaultOpacity;
    size = size || XArrow.defaultSize;
    weight = weight || XArrow.defaultWeight;

    var shape = XArrowShape.get(angle, size, weight);

    var clr = XMaps.parseColor(color, XArrow.defaultColor);
    var alpha = (1 - opacity) * 255;
    var width = (shape.offs << 1) + 1;
    var height = (shape.offs << 1) + 1;
    var src = "http://www.google.com/maplinedraw?width=" + width +
            "&height=" + height + "&path=" + shape.path + "&color=" + clr.red +
            "," + clr.green + "," + clr.blue + "," + alpha + "&weight=" + weight;

    return { src: src, width: width, height: height, anchor: shape.anchor };
}


// XPolyline is an extension of GPolyline that allows for longer polylines and
// for patterns on the line.

XPolyline.vectorScalars = [131072, 65536, 32768, 16384, 8192, 4096, 2048, 1024,
        512, 256, 128, 64, 32, 16, 8];
XPolyline.defaultStyle = {
        color: '#0000ff',
        weight: 5,
        opacity: 0.45,
        pattern: null,
        segmentCount: null,
        beginArrow: false,
        endArrow: false,
        arrowsEvery: null,
        zIndex: 9000,
        font: XMaps.defaultFont,
        text: null,
        textEvery: 200,
        textFgStyle: {
            color: '#000000',
            weight: 2,
            opacity: 1,
            pattern: null,
            segmentCount: null,
            arrowsEvery: null,
            zIndex: 9020
        },
        textBgStyle: {
            color: null,
            weight: 7,
            opacity: 1,
            pattern: null,
            segmentCount: null,
            arrowsEvery: null,
            zIndex: 9010
        }
};

XPolyline.tempPoint0 = new GPoint(0, 0);
XPolyline.tempPoint1 = new GPoint(0, 0);

function XPolyline(points, style) {
    this.points = null;
    this.nextPointIndexAtLevel = null;
    this.pointCount = 0;
    if (points) {
        this.points = [];
        for (var i = 0; i < points.length; i++) {
            this.points.push(points[i].y / 1.0e-5);
            this.points.push(points[i].x / 1.0e-5)
        }
        this.pointCount = points.length;
        this.nextPointIndexAtLevel = [[]];
        for (var i = 0; i < this.points.length / 2; i++) {
            this.nextPointIndexAtLevel[0][i] = i + 1
        }
    }

    style = style || {};
    this.style = this.createStyle(style, XPolyline.defaultStyle);

    this.polyline = this.createXPolyline(this.style);

    if (this.style.text) {
        style.textFgStyle = style.textFgStyle || {};
        this.style.textFgStyle = this.createStyle(style.textFgStyle, XPolyline.defaultStyle.textFgStyle, style);
        this.textFgPolyline = this.createXPolyline(this.style.textFgStyle, true);

        style.textBgStyle = style.textBgStyle || {};
        this.style.textBgStyle = this.createStyle(style.textBgStyle, XPolyline.defaultStyle.textBgStyle, style);
        this.textBgPolyline = this.createXPolyline(this.style.textBgStyle, true);
    }

    var from, to;

    if (this.style.beginArrow) {
        if (this.style.segmentCount) {
            var distanceAndAngle = XMaps.model.getDistanceAndAngle(this.getPoint(0), this.getPoint(1));
            distanceAndAngle.distance.value /= this.style.segmentCount;
            from = XMaps.model.getPointAtDistanceAndAngle(this.getPoint(0), distanceAndAngle.distance, distanceAndAngle.angle);
        } else {
            from = this.getPoint(1);
        }
        to = this.getPoint(0);
        this.beginArrow = new XArrow(from, to, to, this.style.color, this.style.opacity);
    }

    if (this.style.endArrow) {
        if (this.style.segmentCount) {
            var distanceAndAngle = XMaps.model.getDistanceAndAngle(this.getPoint(this.pointCount - 1), this.getPoint(this.pointCount - 2));
            distanceAndAngle.distance.value /= this.style.segmentCount;
            from = XMaps.model.getPointAtDistanceAndAngle(this.getPoint(this.pointCount - 1), distanceAndAngle.distance, distanceAndAngle.angle);
        } else {
            from = this.getPoint(this.pointCount - 2);
        }
        to = this.getPoint(this.pointCount - 1);
        this.endArrow = new XArrow(from, to, to, this.style.color, this.style.opacity);
    }
}

XPolyline.prototype.createXPolyline = function(style, textRendering) {
    var polyline = new GPolylineWrapper(this.points, this.nextPointIndexAtLevel, style);
    polyline.style.pattern = this.style.pattern;
    polyline.style.text = this.style.text;
    polyline.style.font = this.style.font;
    polyline.textRendering = textRendering;
    polyline.textEvery = this.style.textEvery;
    polyline.polylineWeight = this.style.weight;
    if (this.style.textFgStyle) {
        polyline.textFgWeight = this.style.textFgStyle.weight;
    }
    return polyline;
}

XPolyline.prototype.createStyle = function(sourceStyle, defaultStyle, baseStyle) {
    if (!sourceStyle) { return null }
    baseStyle = baseStyle || {};
    var destStyle = {};
    for (key in defaultStyle) {
        destStyle[key] = sourceStyle[key] || defaultStyle[key] || baseStyle[key];
    }
    return destStyle;
}

XPolyline.prototype.getPoint = GPolyline.prototype.getPoint;

XPolyline.prototype.initialize = function(map) {
    this.map = map;
    if (this.polyline) { this.polyline.initialize(map) }

    if (this.textFgPolyline) { this.textFgPolyline.initialize(map) }
    if (this.textBgPolyline) { this.textBgPolyline.initialize(map) }

    if (this.beginArrow) { this.beginArrow.initialize(map) }
    if (this.endArrow) { this.endArrow.initialize(map) }
}

XPolyline.prototype.remove = function() {
    if (this.polyline) { this.polyline.remove() }

    if (this.textFgPolyline) { this.textFgPolyline.remove() }
    if (this.textBgPolyline) { this.textBgPolyline.remove() }

    if (this.beginArrow) { this.beginArrow.remove() }
    if (this.endArrow) { this.endArrow.remove() }
}

XPolyline.prototype.copy = function() {
/*    var copy = new XPolygon(null);
    copy.points = this.points;
    copy.polylineStyle = this.polylineStyle;
    if (this.polyline