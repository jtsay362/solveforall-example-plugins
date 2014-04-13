function shouldActivate(q, recognitionResults, context) { 
  var resultList = recognitionResults['com.solveforall.recognition.location.UsAddress'];
  
  if (!resultList || (resultList.length == 0)) {
    return false;
  }

  var zipCode = resultList[0].zipCode;
  return zipCode && (zipCode.length == 5);
}
