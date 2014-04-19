/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global _, HostAdapter, hostAdapter */

function generateResults(recognitionResults, q, context) {
  var results = recognitionResults['com.solveforall.recognition.business.UPSTrackingNumber'];
  if (!results) {
    return null;
  }    
  
  return [{
    label: 'UPS',
    uri: 'http://wwwapps.ups.com/WebTracking/processRequest?HTMLVersion=5.0&Requester=NES&AgreeToTermsAndConditions=yes&loc=en_US&tracknum=' + 
      encodeURIComponent(results[0].matchedText || q),
    iconUrl: 'http://www.ups.com/favicon.ico',
    tooltip: 'UPS Tracking Number',
    summaryHtml: 'Track at package sent by UPS.',
    embeddable: false,
    relevance: results[0].recognitionLevel
  }];  
}



