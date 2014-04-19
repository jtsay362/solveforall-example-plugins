/** Based on http://www.codeproject.com/KB/recipes/Generate_UPS_Check_Digit.aspx
 */
/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global _, HostAdapter, hostAdapter */
function calculate_check_digit(trk) {
  var runningtotal = 0;

  for (var i = 0; i < trk.length; i++) {
    var c = trk.charCodeAt(i) - 48;

    if ((i & 1) == 1)  {        
      if ((c >= 0) && (c < 9)) {
        runningtotal += (2 * c);            
      } else  {          
        runningtotal += c;
      }
    } else {        
       if ((c >= 0) && (c < 9)) {
         runningtotal += c;
       } else {
         // Indicates alpha value 
         runningtotal += ((2 * c) - (9 * (c / 5)));
       }
    }
  }

  var x = (runningtotal % 10);
  if (x == 0)  {
   return 0;
  } else {
   return (10 - x);
  }
}

function recognize(s, context) {
  var startIndex = s.indexOf("1Z");
  
  if (startIndex < 0) {
    return null;
  }
  
  s = s.substring(startIndex);
  
  if (s.length < 18) {
    return null;
  }
  
  s = s.substring(0, 18);
  
  var recognitionLevel = 0.0;
  var extraInfo = { 
    valid : false 
  };
   
  function makeReturnValue()
  { 
    
    var result = extraInfo;
    result.matchedText = s;
    result.recognitionLevel = recognitionLevel;
    
    return {
      'com.solveforall.recognition.business.UPSTrackingNumber' : [result]
    };    
  }
    
  extraInfo.accountNumber = s.substring(2, 8);

  recognitionLevel = 0.25;
    
  var code = s.substring(8, 10);
  
  if (code == "01")
  {
    extraInfo.serviceType = 'Next Day Air';        
  }
  else if (code == '02')
  {
    extraInfo.serviceType = 'Second Day Air';        
  }
  else if (code == '03')
  {
    extraInfo.serviceType = 'Ground';    
  }
  else
  {
    return makeReturnValue();
  }

  extraInfo.invoiceNumber = s.substring(10, 15);
  
  extraInfo.packageNumber = s.substring(15, 17);  
    
  if (calculate_check_digit(s.substring(2, 17)) !=  s.charAt(17))
  {
    return makeReturnValue();
  }
  
  recognitionLevel = 1.0;
  extraInfo.valid = true;
  
  return makeReturnValue();
}
