/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global _, HostAdapter, hostAdapter */
function generateResults(recognitionResults, q, context) {
  const resultList = recognitionResults['com.solveforall.recognition.lang.chinese.Chinese'];

  if (!resultList) {
    return null;
  }

  const word = resultList[0].traditional;
  return [{
    label: 'MDBG',
    iconUrl: 'http://www.mdbg.net/favicon.ico',
    uri: 'http://www.mdbg.net/chindict/mobile.php?mwddw=' + encodeURIComponent(word) + '&handler=DecomposeWord',
    embeddable: true,
    tooltip: 'Lookup ' + word + ' on MDBG'
  }];
}
