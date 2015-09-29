/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global _, HostAdapter, hostAdapter */
function generateResults(recognitionResults, q, context) {
  const LABEL = "Maven Central";
  const ICON_URL = "https://search.maven.org/favicon.ico";
  const URL_PREFIX = "https://search.maven.org/#search%7Cga%7C1%7C";
  const EMBEDDABLE = false; // Page does some Ajax that doesn't work

  const resultList = recognitionResults['com.solveforall.recognition.programming.java.JavaClassName'];

  if (resultList && resultList[0]) {
    return _(resultList).map(function (result) {
      let uri = URL_PREFIX;

      if (result.packageName && (result.packageName.length > 0)) {
        uri += 'fc%3A%22';
        uri += encodeURIComponent(result.fullyQualifiedClassName);
      } else {
        uri += 'c%3A%22';
        uri += encodeURIComponent(result.simpleClassName);
      }
      uri += '%22';

      return {
        label: LABEL,
        iconUrl: ICON_URL,
        uri: uri,
        tooltip: 'Search Maven Central for ' + result.fullyQualifiedClassName,
        relevance: result.recognitionLevel,
        embeddable: EMBEDDABLE
      };
    });
  }

  return [{
    label: LABEL,
    iconUrl: ICON_URL,
    uri: URL_PREFIX + encodeURIComponent(q),
    tooltip: 'Search Maven Central for ' + q,
    relevance: 0.0,
    embeddable: EMBEDDABLE
  }];
}
