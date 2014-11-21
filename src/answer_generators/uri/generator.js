/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global _, HostAdapter, hostAdapter */

function generateResults(recognitionResults, q, context) {
  'use strict';  
  return _(recognitionResults['com.solveforall.recognition.WebUrl'] || []).map(function (rr) {
    return {
      label: 'URI',
      uri: rr.matchedText,
      relevance: rr.recognitionLevel              
    };          
  });     
}