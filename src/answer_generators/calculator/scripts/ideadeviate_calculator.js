/*jslint browser: true, continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global $, _ */

/*
Copyright (C) 2012 Ideaviate AB

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var Calculator = function () {
  "use strict";
  var initialValue = $('#display').text().trim();

  // Helper variable declarations
  var self = this;

  self.value = initialValue || '0';
  self.sum = initialValue || 0;
  self.prevOperator = null;
  self.isShowing = false;

  self.display = function(v) {
    $('.expression_holder').css('visibility', 'hidden');
    if (v) {
      self.value = v;
      $('#display').text('' + v);
      return v;
    } else {
      return self.value;
    }
  };

  self.isShowingResult = function() {
    return self.isShowing;
  };

  self.setShowingResult = function(isShowing) {
    return (self.isShowing = isShowing);
  };

  // Callback for each number button
  self.digit = function (n) {
     // If a result has been shown, make sure we
     // clear the display before displaying any new numbers
     if (self.isShowingResult()) {
       self.clearDisplay();
       self.setShowingResult(false);
     }

     // Make sure we only add one decimal mark
     if (n === '.' && self.display().indexOf('.') > -1) {
       return;
     }

     // Make sure that we remove the default 0 shown on the display
     // when the user press the first number button
     var d = self.display();
     var newValue = (d === '0') ? n : (d + n);

     if (newValue === '.') {
        newValue = '0.';
     }

     self.display(newValue);
  };

  // Callback for each operator button
  self.operator = function (op) {
   // Only perform calculation if numbers
   // has been entered since last operator button was pressed
   if (!self.isShowingResult()) {
       // Perform calculation
       var x = parseFloat(self.display(), 10);
       switch (self.prevOperator) {
           case 'plus':
               self.sum += x;
               break;
           case 'minus':
               self.sum -= x;
               break;
           case 'multiply':
               self.sum *= x;
               break;
           case 'divide':
               self.sum /= x;
               break;
           default:
               self.sum = x;
       }
   }

   // Avoid showing a result until you have at least
   // two terms to perform calculation on
   if (self.prevOperator) {
     var displayValue = self.sum.toPrecision(10);

     if (displayValue.indexOf('.') >= 0) {
       var length = displayValue.length;
       while (displayValue.substr(length - 1) === '0') {
         displayValue = displayValue.substr(0, length - 1);
         length -= 1;
       }

       if (displayValue.substr(length - 1) === '.') {
         displayValue = displayValue.substr(0, length - 1);
         length -= 1;
       }

       if (length === 0) {
         displayValue = '0';
       }
     }
     self.display(displayValue);
   }

   // Make sure we don't try to calculate with the equal sign
   self.prevOperator = (op === '=') ? null : op;
   // Always set the calculator into showing result state
   // after an operator button has been pressed
   self.setShowingResult(true);
  };

  // Callback for negating a number
  self.negate = function () {
     var d = self.display();

     // Disable the negate button when showing a result
     if (self.isShowingResult() || d === '0') {
         return;
      }

     var newValue = (d.substr(0, 1) === '-') ? d.substr(1) : '-' + d;
     self.display(newValue);
  };

  // Callback for each backspace button
  self.backspace = function (item, event) {
     // Disable backspace if the calculator is shown a result
     if (self.isShowingResult()) {
         return;
      }

     // Remove the last character, and make the display zero when
     // last character is removed
     var d = self.display();
     if (d.length > 1) {
       self.display(d.substr(0, d.length - 1));
     } else {
       self.clearDisplay();
     }
  };

  // Clear the entire calculator
  self.clear = function () {
     self.prevOperator = null;
     self.clearDisplay();
     self.sum = 0;
  };

  // Clear just the display
  self.clearDisplay = function () {
     self.display('0');
  };
};

$('#calculator').ready(function() {
  var calculator = new Calculator();

  $('#calculator-button-clear').click(function() {
    calculator.clear();
  });

  $('#calculator-button-backspace').click(function() {
    calculator.backspace();
  });

  $('#calculator-button-negate').click(function() {
    calculator.negate();
  });

  $('#calculator-button-dot').click(function() {
    calculator.digit('.');
  });

  var operators = ['plus', 'minus', 'multiply', 'divide', 'equal'];

  $.each(operators, function (index, operator) {
    $('#calculator-button-' + operator).click(function() {
      calculator.operator(operator);
    });
  });

  function makeDigitHandler(digit) {
    return function() {
      calculator.digit('' + digit);
    };
  }

  for (var digit = 0; digit < 10; digit++) {
    $('#calculator-button-' + digit).click(makeDigitHandler(digit));
  }

  // Key codes and their associated calculator buttons
  var calculatorKeys = {
     48: '0', 49: '1', 50: '2', 51: '3', 52: '4', 53: '5', 54: '6',
     55: '7', 56: '8', 57: '9', 96: '0', 97: '1', 98: '2', 99: '3',
     100: '4', 101: '5', 102: '6', 103: '7', 104: '8', 105: '9',
     106: 'multiply', 107: 'plus', 109: 'minus', 110: 'dot', 111: 'divide',
     8: 'backspace', 13: 'equal', 46: 'clear', 67: 'clear', 27: 'clear'
  };

  $('.body').keyup(function(e) {
     // Check if the key was one of our calculator keys
     if (e.which in calculatorKeys) {
       // Get button-element associated with key
       var element = $('#calculator-button-' + calculatorKeys[e.which]);
       // Simulate button click on keystroke
       $(element).addClass('active');
       setTimeout(function () { $(element).removeClass('active'); }, 100);
       // Fire click event
       $(element).click();
     }
  });
});

