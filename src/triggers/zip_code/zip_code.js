/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global _ */

function shouldActivate(q, recognitionResults, context) {
  const resultList = recognitionResults['com.solveforall.recognition.location.UsAddress'];

  if (!resultList || (resultList.length === 0)) {
    return false;
  }

  const zipCode = resultList[0].zipCode;
  return !!zipCode && (zipCode.length === 5);
}
