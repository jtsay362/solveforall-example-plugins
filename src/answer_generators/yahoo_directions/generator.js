/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global _, HostAdapter, hostAdapter */
var ANY_USAGE_TYPE = "any";

function isNonBlankString(s) {
  'use strict';
  return s && (s.trim().length > 0);
}

function generateResults(recognitionResults, q, context) {
  'use strict';
    
  var user = context.user;
  
  if (!user || !user.physicalAddresses || (user.physicalAddresses.length === 0)) {
    console.info("No physical addresses available");
    return [];
  }
  
  var preferredUsageType = context.settings.preferredUsageType || ANY_USAGE_TYPE;

  var rrs = recognitionResults['com.solveforall.recognition.location.UsAddress'];
  var destAddressString = q;
  var relevance = 0.0;
  if (rrs && (rrs.length > 0)) {
    var rr = rrs[0];
    
    if (isNonBlankString(rr.city)) {    
      destAddressString = rr.normalizedFullAddressWithoutCountry;
      relevance = rrs[0].recognitionLevel;
    } else {      
      // Yahoo! Directions requires a city
      return []; 
    }
  }
    
  var startAddress = _(user.physicalAddresses).find(function (address) {
    return (address.country && (address.country.name === 'United States') &&
      ((address.usageType === preferredUsageType) || (preferredUsageType === ANY_USAGE_TYPE)));
  });
  
  if (!startAddress) {
    startAddress = _(user.physicalAddresses).find(function (address) {
      return (address.country && (address.country.name === 'United States'));
    });    
  }
  
  if (!startAddress) {
    console.info("No US address found");
    return [];
  }
      
  var startAddressString = '';
  
  if (isNonBlankString(startAddress.addressLine1)) {
    startAddressString += startAddress.addressLine1;     
    startAddressString += ', ';
  }
  
  var hasCity = isNonBlankString(startAddress.city);
  if (hasCity) {
    startAddressString += startAddress.city;     
  } else {
    return []; 
  }
  
  var hasState = isNonBlankString(startAddress.region.abbreviation);
  if (hasState) {
    if (startAddressString.length > 0) {
      startAddressString += ', ';
    }
    
    startAddressString += startAddress.region.abbreviation;     
  }
  
  if (!hasCity) {
    if (startAddressString.length > 0) {
      startAddressString += ', ';
    }
    
    startAddressString += startAddress.postalCode;    
  }
      
  return [{
    label: 'Yahoo! Directions',
    iconUrl: 'https://www.yahoo.com/favicon.ico',
    uri: 'http://maps.yahoo.com/dd_result.php?q1=' + encodeURIComponent(startAddressString) +
      '&q2=' + encodeURIComponent(destAddressString),
    summaryHtml: 'Directions to ' + _(destAddressString).escapeHTML(),
    embeddable: true,
    relevance: relevance
  }];
}
