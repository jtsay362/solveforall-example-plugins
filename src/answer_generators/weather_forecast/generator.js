/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/* global _ */

function isCurrentLocationQuery(q) {
  'use strict';
  var lowerQuery = q.toLowerCase();    
  return (lowerQuery.length === 0) || (lowerQuery === 'weather');  
}

function generateResults(recognitionResults, q, context) {
  'use strict';  
  var placeName = q;
  var relevance = 0.0;
  var lat = null;
  var lng = null;  
  var geoResults = recognitionResults['com.solveforall.recognition.location.GeoCoordinates'];
  var geoResult = null;

  if (geoResults && (geoResult.length > 0)) {
    geoResult = geoResults[0];          
  } else {
    var wikipediaResults = recognitionResults['com.solveforall.recognition.WikipediaArticle'];      

    geoResult = _(wikipediaResults).find(function (wr) {
      return wr.longitude && wr.latitude;
    });

    if (geoResult) {
      placeName = geoResult.title;
    }        
  }

  if (geoResult) {
    lat = geoResult.latitude;
    lng = geoResult.longitude;            
    
    relevance = geoResult.recognitionLevel;     
    
    if (q.indexOf('weather') >= 0) {
      relevance = 1.0; 
    }            
  } else if (context.location && context.location.lat && context.location.lng && isCurrentLocationQuery(q)) {
    placeName = 'your location';  
    lat = context.location.lat;
    lng = context.location.lng;
    relevance = 1.0;
  } else {
    console.log('No coordinates found.');
    return [];
  }

  var latString = lat.toFixed(5);
  var lngString = lng.toFixed(5);          

  var settings = context.settings;
  var unitsType = settings.unitsType || 'us';
  var font = settings.font || 'Helvetica';
  var color = settings.color || '#00aaff';
  
  return [{
    label: 'Weather',
    iconUrl: 'http://forecast.io/favicon.ico',
    tooltip: 'View the weather for ' + placeName,    
    uri: 'https://forecast.io/embed/#lat=' + latString + '&lon=' + lngString + '&name=' + 
      encodeURIComponent(placeName) + '&units=' + encodeURIComponent(unitsType) + '&font=' +
      encodeURIComponent(font) + '&color=' + encodeURIComponent(color),
    embeddable: true,
    shouldEmbed: true,
    relevance: relevance,    
    minHeight: 247,    
    preferredHeight: 247,
    minWidth: 200,
    preferredWidth: 400   
  }];
}  
