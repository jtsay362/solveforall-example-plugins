/*jslint continue: true, evil: false, indent: 2, nomen: true, plusplus: true, regexp: false, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/** Based on http://www.codeproject.com/KB/recipes/Generate_UPS_Check_Digit.aspx
 */
function calculate_check_digit(trk) {
  let runningtotal = 0;

  for (let i = 0; i < trk.length; i++) {
    const c = trk.charCodeAt(i) - 48;

    if ((i & 1) === 1)  {
      if ((c >= 0) && (c < 10)) {
        runningtotal += 2 * c;
      } else  {
        runningtotal += ((c - 15) % 10) * 2;
      }
    } else {
       if ((c >= 0) && (c < 10)) {
         runningtotal += c;
       } else {
         runningtotal += (c - 15) % 10;
       }
    }
  }

  const x = (runningtotal % 10);

  if (x === 0)  {
   return '0';
  }
  return '' + (10 - x);
}

function recognize(s, context) {
  const startIndex = s.indexOf("1Z");

  if (startIndex < 0) {
    return null;
  }

  s = s.substring(startIndex);

  if (s.length < 18) {
    return null;
  }

  s = s.substring(0, 18);

  let recognitionLevel = 0.25;
  let serviceType, accountNumber, invoiceNumber, packageNumber, validCheckDigit;
  let valid = false;

  function makeReturnValue() {
    return {
      'com.solveforall.recognition.business.UPSTrackingNumber' : [{
        matchedText: s,
        recognitionLevel,
        serviceType, accountNumber, invoiceNumber, packageNumber, validCheckDigit,
        valid
      }]
    };
  }

  accountNumber = s.substring(2, 8);
  invoiceNumber = s.substring(10, 15);
  packageNumber = s.substring(15, 17);

  const check_digit = calculate_check_digit(s.substring(2, 17));
  validCheckDigit = check_digit;

  let code = s.substring(8, 10);
  if (code == "01") {
    serviceType = 'Next Day Air';
  } else if (code == '02') {
    serviceType = 'Second Day Air';
  } else if (code == '03') {
    serviceType = 'Ground';
  } else {
    serviceType = '(Invalid)';
    return makeReturnValue();
  }

  if (check_digit !==  s.charAt(17)) {
    return makeReturnValue();
  }

  recognitionLevel = 1.0;
  valid = true;

  return makeReturnValue();
}
