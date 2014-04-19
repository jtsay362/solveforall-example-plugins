/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global _, HostAdapter, hostAdapter */

function recognize(s, context) {    
  try {
    var result = eval('function () {' + s + '}');
    
    var isJson = false;
    try {
      JSON.parse(s); 
      isJson = true;
    } catch (je) {
      // Not JSON 
    }
    
    return {
      'com.solveforall.recognition.programming.Javascript' : [
        {
          matchedText: s,
          recognitionLevel: (isJson ? 0.0 : 1.0)
        }
      ]
    };            
  } catch (e) {
    return null;        
  }    
}
