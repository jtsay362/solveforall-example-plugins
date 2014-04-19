/*jslint continue: true, devel: true, evil: true, indent: 2, plusplus: true, rhino: true, unparam: true, vars: true, white: true */
function isNonBlankString(s) {
  'use strict';
  return s && (s.trim().length > 0);
}


function generateResults(recognitionResults, q, context) {
  'use strict';

  var list = recognitionResults['com.solveforall.recognition.location.UsAddress'];
         
  if (!list || (list.length === 0)) {
    return null;
  }
    
  var recognitionResult = list[0];

  var shouldOutput = false;
  
  var address = recognitionResult.streetAddress || '';
  
  if (address.length > 0) {
    var secondaryUnit = recognitionResult.secondaryUnit;
    if (isNonBlankString(secondaryUnit)) {
      address += ' ' + secondaryUnit;
    }      
    
    address += ',';
  }
  
  var city = recognitionResult.city;  
  var hasCity = isNonBlankString(city);
  var state = recognitionResult.stateAbbreviation;
  var hasState = isNonBlankString(state);
      
  if (hasCity) {
    address += city;        
  }
    
  if (hasState) {
    if (hasCity) {
      address += ','; 
    }
    address += state;
    shouldOutput = true;
  }
  
  var zip = recognitionResult.zipCode;
  
  if (isNonBlankString(zip)) {
    if (hasCity || hasState) {
      address += ',';       
    }
    address += zip;
    shouldOutput = true;
  }

  if (!shouldOutput) {
    return null; 
  }
  
  var url = 'http://www.zillow.com/homes/';
  url += address.replace(/\s+/, '-');            
  url += '_rb';

  return [{    
    label: 'Zillow',
    iconUrl: 'http://www.zillow.com/favicon.ico',
    uri: url,
    summaryHtml: 'View ' + _(address).escapeHTML() + ' on Zillow',
    relevance: recognitionResult.recognitionLevel
  }];
}
