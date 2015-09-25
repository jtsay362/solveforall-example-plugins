/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global loadFile, test, testCases, assert, eq, _, recognize */

const template = loadFile('src/answer_generators/public_warnings/warning.html.ejs');
const renderer = require('ejs').compile(template);

testCases(test,
  function setUp() {
  },

  function testSmoke() {
    const html = renderer(_.extend(makeImplicitEjsModel(), {
      recognitionResults: {
        'com.solveforall.recognition.PublicWarning': [{
          title: 'Altria Kills',
          summaryHtml: '<b>Crap</b>',
          bodyHtml: '<p>Altria bites!</p>',
          detailsUrl: 'http://idiedbecauseofaltria.com',
          categories: ['health'],
          keywords: ['drugs', 'evil corporations'],
          created: '04-12-2015T12:05:33',
          updated: '04-15-2015T16:58:12'
        }]
      }
    }));

    assert.that(html.indexOf('<p>Altria bites!</p>') > 0, eq(true));
    assert.that(
      /Created:\s+04\-12\-2015\s+\|\s+Updated:\s+04\-15\-2015/
      .test(html), eq(true));
  }
);
