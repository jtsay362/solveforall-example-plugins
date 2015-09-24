function loadBuiltIns() {
	print('Loading builtins ...');

  [ 'underscore', "underscore.string.min",
    "underscore.inflection.min",    
    "aliases", "console", "ejs"].forEach(function (base) {

		print('loading ' + base);

		var code = loadFile('test_harness/builtins/' + base + '.js')

		//print("got " + code);

    eval(code);
  });

  _.mixin(_.str.exports());

  /*
  Object.keys(ejs).forEach(function (prop) {
    print('ejs.' + prop + ' = ' + ejs[prop]);
  }); */

  print('Loaded builtins.');
}

loadBuiltIns();
