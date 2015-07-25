/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/* global _ */

function isCurrentLocationQuery(q) {
  'use strict';
  const lowerQuery = q.toLowerCase();
  return (lowerQuery.length === 0) || (lowerQuery === 'weather');
}

function generateResults(recognitionResults, q, context) {
  'use strict';
  let placeName = q;
  let relevance = 0.0;
  let lat = null;
  let lng = null;
  let geoResults = recognitionResults['com.solveforall.recognition.location.GeoCoordinates'];
  let geoResult = null;

  if (geoResults && (geoResult.length > 0)) {
    geoResult = geoResults[0];
  } else {
    const wikipediaResults = recognitionResults['com.solveforall.recognition.WikipediaArticle'];

    geoResult = _(wikipediaResults).find(function (wr) {
      const g = wr.geoLocation;
      return g && g.lon && g.lat;
    });

    if (geoResult) {
      placeName = geoResult.title;
      geoResult = {
        longitude: geoResult.geoLocation.lon,
        latitude: geoResult.geoLocation.lat
      }
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

  let latString = lat.toFixed(5);
  let lngString = lng.toFixed(5);

  let settings = context.settings;
  let unitsType = settings.unitsType || 'us';
  let font = settings.font || 'Helvetica';
  let color = settings.color || '#00aaff';

  return [{
    label: 'Weather',
    iconUrl: 'https://forecast.io/favicon.ico',
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
