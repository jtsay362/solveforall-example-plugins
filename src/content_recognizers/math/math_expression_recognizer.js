/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, node: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global _ */

var math = require('math');

function desiredVariableNameBoost(variables) {
  var numVars = variables.length;

  var rv = 0;
  switch (numVars) {
    case 1: {
      var name = variables[0];
      if (name === 'x') {
        return 0.5; 
      } else if (name === 't') {
        return 0.3; 
      } else if (name.length === 1) {
        return 0.1; 
      }
    }
    break;

    case 2: {
      variables.forEach(function (name) {
        switch (name) {
          case 'x':
          case 'y':
          rv += 0.5;
          break;

          case 't':
          case 'u':
          rv += 0.3;
          break;                            

          default:
          if (name.length === 1) {
            rv += 0.1;              
          }
          break;
        }                                      
      });                
    }
    break;

    default: {
      variables.forEach(function (name) {
        switch (name) {
          case 'x':
          case 'y':
          case 'z':
          rv += (1 / numVars);
          break;

          case 't':
          case 'u':
          case 'v':
          rv += (0.6 / numVars);
          break;                            

          default:
          if (name.length === 1) {
            rv += (0.2 / numVars);              
          }
          break;              
        }                                      
      });                
    }
    break;
  }    

  return rv;
}

function variablesInExpression(expr) {
  var obj = {};

  expr.traverse(function (node) {
    if ((node.type === 'SymbolNode') && (math[node.name] === undefined)) {
      obj[node.name] = true;          
    }      
  });

  return Object.keys(obj).sort();
}

function recognize(q, context) {
  var expr = math.parse(q);
  var code = expr.compile(math);    
  var variables = variablesInExpression(expr);
  
  //print('variables in expression ' + q + ' are: ' + variables.join(', '));
  
  //print('code = ' + code);
  
  if (variables.length === 0) {
     //print('eval returned: ' + code.eval());
    
     return {
       'com.solveforall.recognition.Number': [{ 
         matchedText: q,
         recognitionLevel: 0.5,
         doubleValue: code.eval()
       }]
    };        
  } else if (variables.length === 1) {    
    var recognitionLevel = 0.5;
    if (/^[a-zA-Z]+$/.test(q) && (q !== 'e') && (q !== 'pi')) {
      recognitionLevel = 0;
    }

    recognitionLevel += desiredVariableNameBoost(variables);
    
    return {      
      'com.solveforall.recognition.mathematics.SingleVariableFunction': [{ 
         matchedText: q,
         recognitionLevel: recognitionLevel,
         variableName: variables[0],
         canonicalExpression: expr.toString()
      }]
    };                 
  } else {
    return { 
      'com.solveforall.recognition.mathematics.MultipleVariableFunction': [{ 
         matchedText: q,
         recognitionLevel: desiredVariableNameBoost(variables),
         variables: variables,
         canonicalExpression: expr.toString()
      }]      
    };
  }
}