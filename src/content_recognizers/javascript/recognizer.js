function recognize(s, context) {    
  try {
    var result = eval('function () {' + s + '}');
    
    return {
      'com.solveforall.recognition.programming.Javascript' : [
        {
          matchedText: s,
          recognitionLevel : 1.0,
        }
      ]
    };            
  } catch (e) {
    return null;        
  }    
}
