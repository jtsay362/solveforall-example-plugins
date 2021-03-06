/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global _, HostAdapter, hostAdapter */

function makeResult(matchedText, recognitionLevel, isValid, parseErrorMessage) {
  'use strict';

  return {
    'com.solveforall.recognition.programming.Xml' : [
      {
        matchedText: matchedText,
        recognitionLevel : recognitionLevel,
        isValid: isValid,
        parseErrorMessage: parseErrorMessage || null
      }
    ]
  };
}

function recognize(s, context) {
  'use strict';

  var firstStartBracketIndex = -1;
  var firstEndBracketIndex = -1;
  var firstSlashIndex = -1;
  var lastEndBracketIndex = -1;

  for (var i = 0; i < s.length; i++) {
    var c = s.charAt(i);

    switch (c) {
      case '<':
      if (firstStartBracketIndex < 0) {
        firstStartBracketIndex = i;
      }
      break;

      case '>':      
      if (firstStartBracketIndex >= 0) {
        if (firstEndBracketIndex < 0) {
          firstEndBracketIndex = i;
        }
        lastEndBracketIndex = i;
      }      
      break;

      case '/':
      if (firstStartBracketIndex >= 0) {
        if (firstSlashIndex < 0) {
          firstSlashIndex = i;
        }
      }
      break;

      default:
      break;
    }
  }

  var matchedText = '';

  if ((firstStartBracketIndex < 0) || (firstEndBracketIndex < 0) || (firstSlashIndex < 0)) {
    if ((firstStartBracketIndex >= 0) && (firstEndBracketIndex > firstStartBracketIndex)) {
      matchedText = s.substring(firstStartBracketIndex, lastEndBracketIndex + 1);
      return makeResult(matchedText, 0.2, false);
    }

    return null;
  } else {
    matchedText = s.substring(firstStartBracketIndex, lastEndBracketIndex + 1);
  }


  try {
    var toParse = matchedText.replace(/^<\?[^?]+\?>/, '');
    // FIXME: doesn't handle - in comments
    toParse = toParse.replace(/<!--[^\-]*-->/, '');
  
    new XML(toParse);
    return makeResult(matchedText, 1.0, true);
  } catch (e) {
    var parseErrorMessage = null;
    if (e instanceof TypeError) {
      parseErrorMessage = e.message;
    }   

    return makeResult(matchedText, 0.6, false, parseErrorMessage);
  }    
}
