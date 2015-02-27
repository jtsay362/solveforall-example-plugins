/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global loadFile, test, testCases, assert, eq, _, recognize */

eval(loadFile('src/content_recognizers/math/math_expression_recognizer.js'));

var context = { settings: {} };
testCases(test,
  function setUp() {  
  },


  function testNumber() {
    var r = recognize('999999', context);
    var numbers = r['com.solveforall.recognition.Number'];
    var n = numbers[0];

    assert.that(n.matchedText, eq('999999'));
    assert.that(n.recognitionLevel, eq(0.5));
    assert.that(n.doubleValue, eq(999999));  
  },
            
  function testPi() {
    var r = recognize('pi', context);
    var numbers = r['com.solveforall.recognition.Number'];
    var n = numbers[0];

    assert.that(n.matchedText, eq('pi'));
    assert.that(n.recognitionLevel, eq(0.5));
    assert.that(n.doubleValue, eq(Math.PI));  
  }, 
  
  function testE() {
    var r = recognize('e', context);
    var numbers = r['com.solveforall.recognition.Number'];
    var n = numbers[0];

    assert.that(n.matchedText, eq('e'));
    assert.that(n.recognitionLevel, eq(0.5));
    assert.that(n.doubleValue, eq(Math.E));  
  }, 
          
  function testNumberPrefixingVariable() {
    var r = recognize('26x - 7pi^2', context);
    var fs = r['com.solveforall.recognition.mathematics.SingleVariableFunction'];
    var f = fs[0];

    assert.that(f.matchedText, eq('26x - 7pi^2'));
    assert.that(f.recognitionLevel, eq(1));      
  },
  
  function testNumberPrefixingConstant() {
    var r = recognize('-3pi/2', context);
    var numbers = r['com.solveforall.recognition.Number'];
    var n = numbers[0];

    assert.that(n.matchedText, eq('-3pi/2'));
    assert.that(n.recognitionLevel, eq(0.5));
    assert.that(n.doubleValue, eq(-3 * Math.PI / 2));  
  },

  function testExp() {
    var r = recognize('exp(21)', context);  
    var numbers = r['com.solveforall.recognition.Number'];
    var n = numbers[0];
    assert.that(n.matchedText, eq('exp(21)'));
    assert.that(n.recognitionLevel, eq(0.5));
    assert.that(n.doubleValue, eq(Math.exp(21)));
  },
          
  function testNegativeExponent() {
    var r = recognize('9^-2', context);
    var numbers = r['com.solveforall.recognition.Number'];
    var n = numbers[0];

    assert.that(n.matchedText, eq('9^-2'));
    assert.that(n.recognitionLevel, eq(0.5));
    assert.that(n.doubleValue, eq(1/81));  
  },
            
  function testGamma() {
    var r = recognize('gamma(1/2)', context);
    var numbers = r['com.solveforall.recognition.Number'];
    var n = numbers[0];

    assert.that(n.matchedText, eq('gamma(1/2)'));
    assert.that(n.recognitionLevel, eq(0.5));
    assert.that(n.doubleValue.toFixed(6), eq(Math.sqrt(Math.PI).toFixed(6)));  
  },
          
  function testSine() {
    var r = recognize('sin(pi/2)', context);
    var numbers = r['com.solveforall.recognition.Number'];
    var n = numbers[0];

    assert.that(n.matchedText, eq('sin(pi/2)'));
    assert.that(n.recognitionLevel, eq(0.5));
    assert.that(n.doubleValue, eq(1));  
  },          
          
  function testMultiplicativeFactors() {
    var r = recognize('(2x-1)(2x+1)', context);
    var fs = r['com.solveforall.recognition.mathematics.SingleVariableFunction'];
    var f = fs[0];

    assert.that(f.matchedText, eq('(2x-1)(2x+1)'));
    assert.that(f.recognitionLevel, eq(1));      
  },
          
  function testSubtract() {
    var r = recognize('exp(x^-2)-1', context);
    var fs = r['com.solveforall.recognition.mathematics.SingleVariableFunction'];
    var f = fs[0];

    assert.that(f.matchedText, eq('exp(x^-2)-1'));
    assert.that(f.recognitionLevel, eq(1));            
  },
          
  function testFactorial() {
    var r = recognize('5!', context);
    var numbers = r['com.solveforall.recognition.Number'];
    var n = numbers[0];

    assert.that(n.matchedText, eq('5!'));
    assert.that(n.recognitionLevel, eq(0.5));
    assert.that(n.doubleValue, eq(120));  
  },
          
  function testSpaces() {
    var r = recognize('2*30 - 25/ 5', context);
    var numbers = r['com.solveforall.recognition.Number'];
    var n = numbers[0];

    assert.that(n.matchedText, eq('2*30 - 25/ 5'));
    assert.that(n.recognitionLevel, eq(0.5));
    assert.that(n.doubleValue, eq(55));      
  }
);
