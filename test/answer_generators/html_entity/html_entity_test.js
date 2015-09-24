/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global loadFile, test, testCases, assert, eq, _, ejs, recognize */

var template = loadFile('src/answer_generators/html_entity/html_entity.html.ejs');
var renderer = ejs.compile(template);

var context = { settings: {} };
testCases(test,
  function setUp() {
  },

  function testSmoke() {
    var html = renderer({
      recognitionResults: {
       'com.solveforall.recognition.programming.web.html.Entity': [{
          "recognitionLevel": 1,
          "symbol": "&",
          "code": "&#38;",
          "aliases": [
            "ampersand"
          ],
          "matchedText": "&amp;",
          "namedCodes": ["&amp;"]
        }]
      }
    });
    assert.that(html.indexOf('<span class=\"symbol\">&amp;</span>') > 0,
                eq(true));
  }
);
