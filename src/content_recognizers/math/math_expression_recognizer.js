/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, node: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global _, min */

const math = require('math');

function desiredVariableNameBoost(variables) {
  const numVars = variables.length;

  let rv = 0;
  switch (numVars) {
    case 1: {
      let name = variables[0];
      if (name === 'x') {
        return 1.0;
      } else if (name === 't') {
        return 0.8;
      } else if (name.length === 1) {
        return 0.25;
      }
    }
    break;

    case 2: {
      variables.forEach(function (name) {
        switch (name) {
          case 'x':
          case 'y':
          rv += 0.25;
          break;

          case 't':
          case 'u':
          rv += 0.15;
          break;

          default:
          if (name.length === 1) {
            rv += 0.05;
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
  const obj = {};

  expr.traverse(node => {
    const name =  node.name;
    if ((node.type === 'SymbolNode') && (math[name] === undefined)) {
      let isVariable = true;
      try {
        let u = math.unit('1 ' + name);
        isVariable = !u.equalBase;
      } catch (ex) {
        ;
      }
      if (isVariable) {
        obj[name] = true;
      }
    }
  });

  return Object.keys(obj).sort();
}

function recognize(q, context) {
  if (!q) {
    return null;
  }

  const m = /^(?:((?:(?:graph|plot)(?:\s+of)?)|convert|calculate|compute|draw)\s+)?(?:([\w(,\s]+\)?)\s*=\s*)?([^=]+)$/.exec(q);
  let assignedTo = null;
  let expression = q;
  let command = null;
  if (m) {
    //print("Matched " + q + ", m[1] = " + m[1] + ", m[2] = " + m[2] + ", m[3] = " + m[3]);
    if (m[1]) {
      command = m[1].trim();
      if (_.str.endsWith(command, 'of')) {
        command = command.substr(0, command.length - 2).trim();
      }
    }
    if (m[2]) {
      assignedTo = m[2].trim();
    }
    expression = m[3];
  }

  const expr = math.parse(expression);
  // For Math 2.x: let code = expr.compile();
  const code = expr.compile(math);
  const variables = variablesInExpression(expr);

  //print('variables in expression ' + expression + ' are: ' + variables.join(', '));

  //print('code = ' + code);
  let recognitionLevel = 0.0;

  if (command) {
    recognitionLevel = 1.0;
  }

  const result = {
    matchedText: q,
    command,
    assignedTo,
    expression
  };

  if (variables.length === 0) {
    //print('eval returned: ' + code.eval());
    let y = code.eval();
    let unit = null;

    if ((typeof y === 'object') && y.equalBase) {
      const unitJson = y.toJSON();
      y = unitJson.value;
      unit = unitJson.unit;
    }

    result.recognitionLevel = recognitionLevel;
    result.doubleValue = y;
    result.unit = unit;

    return {
      'com.solveforall.recognition.Number': [result]
    };
  } else if (variables.length === 1) {
    if (!command && /^[a-zA-Z\s]+$/.test(expression) &&
        (expression !== 'e') && (expression !== 'pi')) {
      recognitionLevel = 0;
    }

    recognitionLevel += desiredVariableNameBoost(variables);
    result.recognitionLevel = min(recognitionLevel, 1.0);
    result.canonicalExpression = expr.toString();
    result.variableName = variables[0];

    return {
      'com.solveforall.recognition.mathematics.SingleVariableFunction': [result]
    };
  } else {
    recognitionLevel += desiredVariableNameBoost(variables);
    result.recognitionLevel = min(recognitionLevel, 1.0);
    result.canonicalExpression = expr.toString();
    result.variables = variables;

    return {
      'com.solveforall.recognition.mathematics.MultipleVariableFunction': [result]
    };
  }
}
