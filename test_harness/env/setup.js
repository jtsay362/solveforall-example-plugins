function loadBuiltIns() {
	print('Loading builtins ...');

  [ 'underscore', "underscore.string.min",
    "underscore.inflection.min",
    "aliases", "console"].forEach(function (base) {

		print('loading ' + base);

		var code = loadFile('test_harness/builtins/' + base + '.js')

		//print("got " + code);

    eval(code);
  });

  _.mixin(_.str.exports());

  print('Loaded builtins.');
}

function makeEmptyQueryContext(q) {
	return {
		isSuggestionQuery: false,
		isContentDisplayable: true,
		fullSanitizedQuery: q,
		// Not correct but usually not needed
		tokenizedQuery: {},
		embedded: false,
		client: {
			kind: 'web',
			version: 'unknown',
			src: 'answer_page',
		},
		requestHeaders: [],
		locale: {
			fullText: 'en-US',
			language: 'en',
			variant: 'Linux'
		},
		grantedPermissions: [],
		settings: {},
		developerSettings: {}
	};
};

function makeImplicitEjsModel() {
	return {
		_: _
	};
}

loadBuiltIns();
