/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global _, HostAdapter, hostAdapter, XML */
function generateResults(recognitionResults, q, context) {
  'use strict';

  var list = recognitionResults['com.solveforall.recognition.programming.web.Html'];  
  var content = q;
  var relevance = 0.0;
  
  if (list && (list.length >= 0)) {
    content = list[0].matchedText;  
    relevance = list[0].recognitionLevel;
  }
  
  var serverSideSanitized = !_(context.grantedPermissions).contains('trusted_content');
    
  return [{
    content: content,
    contentType: 'text/html',
    serverSideSanitized: serverSideSanitized,
    trusted: true,
    label: 'HTML Preview',
    iconUrl: '/favicon.ico',    
    relevance: relevance
  }];
}
