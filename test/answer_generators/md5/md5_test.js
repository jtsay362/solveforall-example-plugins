/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global loadFile, test, testCases, assert, eq, _, recognize */

eval(loadFile('build/compiled_templates/answer_generators/md5/md5.html.js'));
const renderer = anonymous;

testCases(test,
  function setUp() {
  },

  function testSmoke() {
    var html = renderer(_.extend(makeImplicitEjsModel(), {
      q: 'password'
    }));

    assert.that(html.indexOf('5f4dcc3b5aa765d61d8327deb882cf99') > 0, eq(true));
  }
);
