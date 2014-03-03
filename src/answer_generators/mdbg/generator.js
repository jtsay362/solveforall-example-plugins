function generateResults
(
  recognitionResults,
  q,
  context
)
{
  var resultList = recognitionResults['com.solveforall.recognition.lang.chinese.Chinese'];

  if (!resultList)
  {
    return null;
  }
  
  return [{
    label: 'MDBG',
    uri: 'http://www.mdbg.net/chindict/mobile.php?mwddw=' + resultList[0].traditional + '&handler=DecomposeWord',
    iconUrl: 'http://www.mdbg.net/favicon.ico'
  }];  
}

