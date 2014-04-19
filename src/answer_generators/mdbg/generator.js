/*jslint continue: true, devel: true, evil: true, indent: 2, plusplus: true, rhino: true, unparam: true, vars: true, white: true */
function generateResults(recognitionResults, q, context) {
  'use strict';
  
  var resultList = recognitionResults['com.solveforall.recognition.lang.chinese.Chinese'];

  if (!resultList) {
    return null;
  }
  
  var word = resultList[0].traditional;
  return [{
    label: 'MDBG',
    iconUrl: 'http://www.mdbg.net/favicon.ico',
    uri: 'http://www.mdbg.net/chindict/mobile.php?mwddw=' + encodeURIComponent(word) + '&handler=DecomposeWord',
    embeddable: true,    
    summaryHtml: 'Lookup ' + _(word).escapeHTML() + ' on MDBG'
  }];  
}

