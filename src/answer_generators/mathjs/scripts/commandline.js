/**
 * A small command line editor to demonstrate the math.js parser.
 * @param {Object} params    Configuration parameter. Available:
 *                           {HTMLElement} container DOM Element to contain
 *                                                   the editor
 *                           {Object} [math]         An instance of math.js
 *                           {String} [id]           Optional id for the editor,
 *                                                   used to persist data.
 *                                                   "default" by default.
 */
function CommandLineEditor (params) {
  // get instance of math.js from params, or create one
  var math = params.math || mathjs();

  // object with utility methods
  var util = {};

  /**
   * Returns the version of Internet Explorer or a -1
   * (indicating the use of another browser).
   * Source: http://msdn.microsoft.com/en-us/library/ms537509(v=vs.85).aspx
   * @return {Number} Internet Explorer version, or -1 in case of an other browser
   */
  util.getInternetExplorerVersion = function getInternetExplorerVersion () {
    var rv = -1; // Return value assumes failure.
    if (navigator.appName == 'Microsoft Internet Explorer')
    {
      var ua = navigator.userAgent;
      var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
      if (re.exec(ua) != null) {
        rv = parseFloat( RegExp.$1 );
      }
    }
    return rv;
  };

  /**
   * Add and event listener
   * @param {Element}  element       An html element
   * @param {string}   action        The action, for example "click",
   *                                 without the prefix "on"
   * @param {function}    listener   The callback function to be executed
   */
  util.addEventListener = function addEventListener(element, action, listener) {
    if (element.addEventListener) {
      element.addEventListener(action, listener, false);
    } else {
      element.attachEvent('on' + action, listener);  // IE browsers
    }
  };

  /**
   * Remove an event listener from an element
   * @param {Element}  element   An html dom element
   * @param {string}   action    The name of the event, for example "mousedown"
   * @param {function} listener  The listener function
   */
  util.removeEventListener = function removeEventListener (element, action, listener) {
    if (element.removeEventListener) {
      element.removeEventListener(action, listener, false);
    } else {
      element.detachEvent('on' + action, listener);  // IE browsers
    }
  };

  /**
   * Stop event propagation
   */
  util.stopPropagation = function stopPropagation (event) {
    if (event.stopPropagation) {
      event.stopPropagation();  // non-IE browsers
    }
    else {
      event.cancelBubble = true;  // IE browsers
    }
  };

  /**
   * Cancels the event if it is cancelable, without stopping further propagation of the event.
   */
  util.preventDefault = function preventDefault (event) {
    if (event.preventDefault) {
      event.preventDefault();  // non-IE browsers
    }
    else {
      event.returnValue = false;  // IE browsers
    }
  };

  /**
   * Clear all DOM childs from an element
   * @param {HTMLElement} element
   */
  util.clearDOM = function clearDOM (element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  };

  // read the parameters
  var container = (params && params.container) ? params.container : undefined;
  if (!container) {
    throw new Error('Required parameter "container" missing in configuration parameters');
  }
  var id = (params && params.id) ? String(params.id) : 'default';

  // clear the container
  util.clearDOM(container);

  // validate if math.js is loaded.
  var error;
  if (typeof math === 'undefined' || !math.parser) {
    error = document.createElement('div');
    error.appendChild(document.createTextNode(
        'Cannot create parser, math.js not loaded.'));
    error.style.color = 'red';
    container.appendChild(error);
    return;
  }

  // validate browser
  // the editor does not work well on IE7
  // TODO: make the demo working on IE7
  var ieVersion = util.getInternetExplorerVersion();
  if (ieVersion == 6 || ieVersion == 7) {
    error = document.createElement('div');
    error.appendChild(document.createTextNode(
        'Sorry, this demo is not available on IE7 and older. The math.js ' +
            'library itself works fine on every version of IE though.'));
    error.style.color = 'red';
    container.appendChild(error);
    return;
  }

  // define parameters
  var dom = {},
      history = [],
      historyIndex = -1,
      parser = math.parser();

  function scrollDown() {
    dom.results.scrollTop = dom.results.scrollHeight;
  }

  // Auto complete current input
  function autoComplete () {
    var name;
    var text = dom.input.value;
    var end = /[a-zA-Z_0-9]+$/.exec(text);
    if (end) {
      var keyword = end[0];
      var matches = [];

      // scope variables
      // TODO: not nice to read the (private) defs inside the scope
      for (var def in parser.scope) {
        if (parser.scope.hasOwnProperty(def)) {
          if (def.indexOf(keyword) == 0) {
            matches.push(def);
          }
        }
      }

      // commandline keywords
      if ('clear'.indexOf(keyword) == 0) {
        matches.push('clear');
      }

      // math functions and constants
      var ignore = ['expr', 'type'];
      for (var func in math) {
        if (math.hasOwnProperty(func)) {
          if (func.indexOf(keyword) == 0 && ignore.indexOf(func) == -1) {
            matches.push(func);
          }
        }
      }

      // units
      var Unit = math.type.Unit;
      for (name in Unit.UNITS) {
        if (Unit.UNITS.hasOwnProperty(name)) {
          if (name.indexOf(keyword) == 0) {
            matches.push(name);
          }
        }
      }
      for (name in Unit.PREFIXES) {
        if (Unit.PREFIXES.hasOwnProperty(name)) {
          var prefixes = Unit.PREFIXES[name];
          for (var prefix in prefixes) {
            if (prefixes.hasOwnProperty(prefix)) {
              if (prefix.indexOf(keyword) == 0) {
                matches.push(prefix);
              }
              else if (keyword.indexOf(prefix) == 0) {
                var unitKeyword = keyword.substring(prefix.length);

                for (var n in Unit.UNITS) {
                  if (Unit.UNITS.hasOwnProperty(n)) {
                    if (n.indexOf(unitKeyword) == 0 && Unit.isValuelessUnit(prefix + n)) {
                      matches.push(prefix + n);
                    }
                  }
                }
              }
            }
          }
        }
      }

      // TODO: in case of multiple matches, show a drop-down box to select one
      var firstMatch = matches[0];
      if (firstMatch) {
        text = text.substring(0, text.length - keyword.length) + firstMatch;
        dom.input.value = text;
      }
    }
  }

  /**
   * KeyDown event handler to catch global key presses in the window
   * @param {Event} event
   */
  function onWindowKeyDown (event) {
    if (dom.frame.parentNode != container) {
      destroy();
    }

    event = event || window.event;
    var target = event.target || event.srcElement;
    var keynum = event.which || event.keyCode;
    if (keynum == 83) { // s
      if (target.nodeName.toUpperCase() != 'INPUT') {
        dom.input.focus();
        util.preventDefault(event);
        util.stopPropagation(event);
      }
    }
    else if (keynum == 71) { // g
      if (target.nodeName.toUpperCase() != 'INPUT') {
        var search = document.getElementById('gsc-i-id1');
        if (search) search.focus();
        util.preventDefault(event);
        util.stopPropagation(event);
      }
    }
  }

  /**
   * KeyDown handler for the input field
   * @param event
   * @returns {boolean}
   */
  function onKeyDown (event) {
    event = event || window.event;

    var keynum = event.which || event.keyCode;
    switch (keynum) {
      case 9: // Tab
        autoComplete();
        util.preventDefault(event);
        util.stopPropagation(event);
        return false;
        break;

      case 13: // Enter
        evalInput();
        util.preventDefault(event);
        util.stopPropagation(event);
        return false;
        break;

      case 38: // Arrow up
        if (historyIndex > 0) {
          historyIndex--;
          dom.input.value = history[historyIndex] || '';
          util.preventDefault(event);
          util.stopPropagation(event);
        }
        return false;
        break;

      case 40: // Arrow down
        if (historyIndex < history.length) {
          historyIndex++;
          dom.input.value = history[historyIndex] || '';
          util.preventDefault(event);
          util.stopPropagation(event);
        }
        return false;
        break;

      default:
        historyIndex = history.length;
        break;
    }

    return true;
  }

  /**
   * Destroy the editor: cleanup HTML DOM and global event listeners
   */
  function create() {
    // create main frame for the editor
    dom.frame = document.createElement('div');
    dom.frame.className = 'cle';
    container.appendChild(dom.frame);

    // create two panels for the layout
    dom.topPanel = document.createElement('div');
    dom.topPanel.className = 'top-panel';
    dom.frame.appendChild(dom.topPanel);
    dom.bottomPanel = document.createElement('div');
    dom.bottomPanel.className = 'bottom-panel';
    dom.frame.appendChild(dom.bottomPanel);

    // create div to hold the results
    dom.results = document.createElement('div');
    dom.results.className = 'results';
    dom.topPanel.appendChild(dom.results);

    // panels for the input field and button
    dom.inputLeft = document.createElement('div');
    dom.inputLeft.className = 'input-left';
    dom.bottomPanel.appendChild(dom.inputLeft);
    dom.inputRight = document.createElement('div');
    dom.inputRight.className = 'input-right';
    dom.bottomPanel.appendChild(dom.inputRight);

    dom.input = document.createElement('input');
    dom.input.className = 'input';
    dom.input.title = 'Enter an expression';
    dom.input.setAttribute('autocomplete', 'off');
    dom.input.setAttribute('autocapitalize', 'off');
    dom.input.setAttribute('autocorrect', 'off');
    dom.input.setAttribute('spellcheck', 'false');
    dom.input.onkeydown = onKeyDown;
    dom.inputLeft.appendChild(dom.input);

    // create an eval button
    dom.btnEval = document.createElement('button');
    dom.btnEval.appendChild(document.createTextNode('Evaluate'));
    dom.btnEval.className = 'btn btn-default eval';
    dom.btnEval.title = 'Evaluate the expression (Enter)';
    dom.btnEval.onclick = evalInput;
    dom.inputRight.appendChild(dom.btnEval);

    // create global event listeners
    util.addEventListener(window, 'keydown', onWindowKeyDown);
  }

  /**
   * Destroy the editor: cleanup HTML DOM and global event listeners
   */
  function destroy() {
    // destroy DOM
    if (dom.frame.parentNode) {
      dom.frame.parentNode.removeChild(dom.frame);
    }

    // destroy event listeners
    util.removeEventListener(window, 'keydown', onWindowKeyDown);
  }

  /**
   * Trim a string
   * http://stackoverflow.com/a/498995/1262753
   * @param str
   * @return {*|void}
   */
  function trim(str) {
    return str.replace(/^\s+|\s+$/g, '');
  }

  /**
   * Load saved expressions or example expressions
   */
  function load() {
    var expr = document.getElementById('data_to_transfer').getAttribute('data-expr');
    if (expr) {
      eval_expr(expr);
    } else {
      eval_expr('0');
    }
  }

  /**
   * Save executed expressions
   */
  function save() {
    if (localStorage) {
      localStorage[id] = JSON.stringify(history);
    }
  }

  function clear() {
    history = [];
    historyIndex = -1;
    parser.clear();

    util.clearDOM(dom.results);
    dom.input.value = '';
    // save(); // TODO: save expressions (first we need a method to restore the examples)
  }

  function eval_expr(expr) {
    expr = trim(expr);

    if (expr == 'clear') {
      clear();
      return;
    }

    if (expr) {
      history.push(expr);
      historyIndex = history.length;

      var res, resStr, title;
      try {
        res = parser.eval('ans = (' + expr + ')');
        resStr = 'ans = ' + math.format(res, { precision: 14 });
        title = 'floating-point result: ' + math.format(res);
      }
      catch (err) {
        resStr = err.toString();
        title = '';
      }

      var preExpr = document.createElement('pre');
      preExpr.className = 'expr';
      preExpr.appendChild(document.createTextNode(expr));
      dom.results.appendChild(preExpr);

      var preRes = document.createElement('pre');
      preRes.className = 'res';
      preRes.appendChild(document.createTextNode(resStr));
      preRes.title = title;
      dom.results.appendChild(preRes);

      scrollDown();
      dom.input.value = '';
      // save();  // TODO: save expressions (first we need a method to restore the examples)
    }
  }

  function evalInput() {
    eval_expr(dom.input.value);
  }

  create();
  load();
}

var container = document.getElementById('commandline');
if (container) {
  var editor = new CommandLineEditor({
    container: container,
    math: math
  });
}
