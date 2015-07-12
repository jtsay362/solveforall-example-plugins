function loadBuiltIns() {
	print('Loading builtins ...');

  [ "ejs", "lodash.underscore.min", "underscore.string.min",
    "underscore.inflection.min", "URI.min",
    "hmac-sha1.min", "enc-base64-min", "oauth-1.0a.min",
    "md5.min", "aliases", "console"].forEach(function (base) {
    eval(loadFile('test_harness/builtins/' + base + '.js'));
  });

  _.mixin(_.str.exports());

  /*
  Object.keys(ejs).forEach(function (prop) {
    print('ejs.' + prop + ' = ' + ejs[prop]);
  }); */

  print('Loaded builtins.');
}

loadBuiltIns();
