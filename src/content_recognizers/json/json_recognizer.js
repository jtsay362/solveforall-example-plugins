/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global _, HostAdapter, hostAdapter */

function recognize(s, context) {    
  try {
    var result = JSON.parse(s);
    
    if (!result || ((typeof result) !== 'object')) {
      return null;
    }     

    return {
      'com.solveforall.recognition.programming.Json' : [
        {
          matchedText: s,
          formattedString: JSON.stringify(result, null, 2),
          recognitionLevel : 1.0
        }
      ]
    };            
  } catch (e) {
    return null;        
  }    
}
