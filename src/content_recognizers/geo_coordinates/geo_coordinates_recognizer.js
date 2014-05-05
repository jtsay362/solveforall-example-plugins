/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global _ */
function recognize(s, context) {
  'use strict';

  var filtered = s.replace(/°|\(|\)|lat(itude)?|lon(g(itude)?)?|lng|gps|geo|coordinates?|maps?/, '');
  
  //console not supported yet
  //console.log('Filtered query = "' + filtered + '"');
  
  var words = filtered.split(/\s+|\s*,\s*/);
  
  if (words.length < 2) {
    return null;     
  }
  
  var latitude = parseFloat(words[0]);
  var longitude = parseFloat(words[1]);
  
  if ((latitude !== null) && (latitude >= -90.0) && (latitude <= 90.0) &&
      (longitude !== null) && (longitude >= -180.0) && (longitude <= 180.0)) {
    return {
      'com.solveforall.recognition.location.GeoCoordinates' : [
        {
          matchedText: words[0] + ' ' + words[1],
          recognitionLevel : 1.0,
          latitude: latitude,
          longitude: longitude
        }
      ]
    };              
  }
  
  return null;
}
  