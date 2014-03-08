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
          formattedString: JSON.stringify(result, 2),
          recognitionLevel : 1.0,
        }
      ]
    };            
  } catch (e) {
    return null;        
  }    
}
