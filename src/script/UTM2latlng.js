function UTM2latlng( northing, easting, zone )  //  adapted from https://stackoverflow.com/a/25709233/3507061
{ // zone has postfix N or S for hemispere - e.f 32N or 52S

  var FalseNorth = 0.   // South or North?
  if ( zone.includes('S') ) FalseNorth = 10000000.  // South or North?
  zone = parseInt( zone );

  var  d = 0.99960000000000004;
  var d1 = 6378137;
  var d2 = 0.0066943799999999998;

  var  d4 = (1 - Math.sqrt(1-d2))/(1 + Math.sqrt(1 - d2));
  var d15 = easting - 500000;
  var d16 = northing;
  var d11 = ((zone - 1) * 6 - 180) + 3;

  var  d3 = d2/(1 - d2);
  var d10 = (d16 - FalseNorth ) / d; // 10000000
  var d12 = d10 / (d1 * (1 - d2/4 - (3 * d2 *d2)/64 - (5 * Math.pow(d2,3))/256));
  var d14 = d12 + ((3*d4)/2 - (27*Math.pow(d4,3))/32) * Math.sin(2*d12) + ((21*d4*d4)/16 - (55 * Math.pow(d4,4))/32) * Math.sin(4*d12) 
          + ((151 * Math.pow(d4,3))/96) * Math.sin(6*d12);
  var d13 = d14 * 180 / Math.PI;
  var  d5 = d1 / Math.sqrt(1 - d2 * Math.sin(d14) * Math.sin(d14));
  var  d6 = Math.tan(d14)*Math.tan(d14);
  var  d7 = d3 * Math.cos(d14) * Math.cos(d14);
  var  d8 = (d1 * (1 - d2))/Math.pow(1-d2*Math.sin(d14)*Math.sin(d14),1.5);

  var  d9 = d15/(d5 * d);
  var d17 = d14 - ((d5 * Math.tan(d14))/d8)*(((d9*d9)/2-(((5 + 3*d6 + 10*d7) - 4*d7*d7-9*d3)*Math.pow(d9,4))/24)
          + (((61 +90*d6 + 298*d7 + 45*d6*d6) - 252*d3 -3 * d7 *d7) * Math.pow(d9,6))/720); 
      d17 = d17 * 180 / Math.PI;
  var d18 = ((d9 - ((1 + 2 * d6 + d7) * Math.pow(d9,3))/6)
             + (((((5 - 2 * d7) + 28*d6) - 3 * d7 * d7) + 8 * d3 + 24 * d6 * d6) * Math.pow(d9,5))/120)/Math.cos(d14);
      d18 = d11 + d18 * 180 / Math.PI;
  return[ d17, d18 ];
}

/*
var ll =  UTM2latlng( n, e, zone ); // all integers
    lat = Math.round(ll[0]*1000000)/1000000;
    lng = Math.round(ll[1]*1000000)/1000000;
*/