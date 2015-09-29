/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global loadFile, test, testCases, assert, eq, _, generateResults */

eval(loadFile('build/plugin_scripts/answer_generators/skype/generator.js'));

testCases(test,
  function setUp() {
  },

  function testSmoke() {
    const q = 'test123';
    const results = generateResults({
      'com.solveforall.recognition.messaging.SkypeAccountName' : [
        {
          accountName: q
        }
      ]
    }, q, makeEmptyQueryContext(q)) ;

    assert.that(results.length, eq(1));

    let result = results[0];

    assert.that(result.uri, eq('skype:test123?call'));
  }
);
