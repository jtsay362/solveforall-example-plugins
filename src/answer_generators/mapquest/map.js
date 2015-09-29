/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global $, _ */

function generateResults(recognitionResults, q, context) {
  let label = null;
  let query = null;

  try {
    const usAddressResults = recognitionResults['com.solveforall.recognition.location.UsAddress'];
    if (usAddressResults && (usAddressResults.length > 0)) {
      query = usAddressResults[0].normalizedFullAddressWithoutCountry;
    } else {
      const geoResults = recognitionResults['com.solveforall.recognition.location.GeoCoordinates'];
      let geoResult = null;

      if (geoResults && (geoResult.length > 0)) {
        geoResult = geoResults[0];
      } else {
        var wikipediaResults = recognitionResults['com.solveforall.recognition.WikipediaArticle'];

        geoResult = _(wikipediaResults).find(function (wr) {
          return wr.longitude && wr.latitude;
        });
      }

      if (geoResult) {
        label = geoResult.matchedText;
        query = ' ' + geoResult.latitude.toFixed(5) + ' ' + geoResult.longitude.toFixed(5);
      }
    }
  } catch (e) {
    console.log('Recognition result not found, falling back to query, error message = "' +
                e.message + "'");
  }

  if (!query) {
    query = q;
  }

  if (label) {
    query += ' (' + encodeURIComponent(label) + ')';
  }

  const settings = context.settings;
  let uri = 'http://mapq.st/' + encodeURIComponent(settings.action || 'embed') +
    '?q=' + encodeURIComponent(query) + '&zoom=' +
    encodeURIComponent(settings.zoomLevel || '11') + '&maptype=' +
    encodeURIComponent(settings.mapType || 'map');

  if (settings.layer) {
    uri += '&layer=' + encodeURIComponent(settings.layer);
  }

  const embeddable = (context.client.kind !== 'web');

  return [{
    label: 'MapQuest',
    tooltip: 'View map on MapQuest',
    uri,
    iconUrl: 'http://www.mapquest.com/favicon.ico',
    embeddable,
    shouldEmbed: embeddable,
    minWidth: 200,
    preferredWidth: 400,
    minHeight: 200,
    preferredHeight: 400
  }];
}
