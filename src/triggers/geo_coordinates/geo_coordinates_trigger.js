/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global _ */

function shouldActivate(q, recognitionResults, context) {
  let resultList = recognitionResults['com.solveforall.recognition.location.GeoCoordinates'];

  if (resultList && (resultList.length > 0)) {
    return true;
  }

  resultList = recognitionResults['com.solveforall.recognition.WikipediaArticle'];

  return _(resultList).any(function (r) {
    if ((r.recognitionLevel > 0.3) && r.geoLocation) {
      return true;
    }
  });
}
