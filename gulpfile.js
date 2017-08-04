/*jslint node: true, continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
var _ = require('lodash');
var gulp = require('gulp');
var babel = require('gulp-babel');
var through = require('through2');
var gutil = require('gulp-util');
var ejs = require('./test_harness/modules/ejs');
var plumber = require('gulp-plumber');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var sass = require('gulp-ruby-sass');
var del = require('del');
var livereload = require('gulp-livereload');
var SOURCE_DIR = 'src';
var OUTPUT_DIR = 'build';

// Modified from https://github.com/christophehurpeau/gulp-ejs-precompiler
var gulpEjs =  function (options) {
  options = options || {};

  var assignToVariable = (options.assignToVariable !== false);
  delete options.assignToVariable;

  var templateVarName = options.templateVarName || 'templates';
  delete options.templateVarName;

  return through.obj(function (file, enc, next) {
      if (file.isNull()) {
          this.push(file);
          return next();
      }

      if (file.isStream()) {
          this.emit(
              'error',
              new gutil.PluginError('gulp-ejs-precompiler', 'Streaming not supported')
          );
          return next();
      }

      options.filename = options.filename || file.path;
      try {
          var contents = file.contents.toString();
          var compiledFunction = ejs.compileToFunctionString(contents, options);
          if (assignToVariable) {
            var prefix = templateVarName + '[' + JSON.stringify(file.relative.slice(0, -4)) +'] = ';
            var suffix = ';'
            compiledFunction = prefix + compiledFunction + suffix;
          }

          //console.log('Got compiled function : ' + compiledFunction);

          file.contents = new Buffer(compiledFunction);
          file.path = gutil.replaceExtension(file.path, '.js');
      } catch (err) {
          console.log('doh!');

          this.emit('error', new gutil.PluginError('gulp-ejs-precompiler', err));
       }

      this.push(file);
      next();
  });
}

var ANSWER_GENERATOR_MODULES = {
  calculator: {
    scripts: ['ideadeviate_calculator']
  },
  calendar: {
    scripts: ['calendar']
  },
  graphr: {
    scripts: ['util', 'calc', 'parser', 'jsgcalc', 'jsgui']
  },
  leaflet: {
    scripts: ['leaflet-providers', 'leaflet']
  },
  mathjs: {
    scripts: ['commandline']
  },
  seatgeek: {
    scripts: ['events']
  }
};

gulp.task('content-scripts', function () {
  return Object.keys(ANSWER_GENERATOR_MODULES).forEach(function (mod) {
    var descriptor = ANSWER_GENERATOR_MODULES[mod];
    return gulp.src(
      _.map(descriptor.scripts, function (f) {
         return SOURCE_DIR + '/answer_generators/' + mod + '/scripts/' + f + '.js';
      }))
    .pipe(babel({
      presets: ['es2015'],
      plugins: ["transform-remove-strict-mode"]
    }))
    .pipe(concat(mod + '.js'))
    .pipe(uglify())
    .pipe(gulp.dest(OUTPUT_DIR + '/answer_generator_content/' + mod + '/scripts/'));
  });
});

gulp.task('debug-process-content-scripts', function () {
  return Object.keys(ANSWER_GENERATOR_MODULES).forEach(function (mod) {
    var descriptor = ANSWER_GENERATOR_MODULES[mod];
    return gulp.src(
      _.map(descriptor.scripts, function (f) {
         return SOURCE_DIR + '/answer_generators/' + mod + '/scripts/' + f + '.js';
      }))
    .pipe(babel({
      presets: ['es2015'],
      plugins: ["transform-remove-strict-mode"]
    }))
    .pipe(concat(mod + '.js'))
    .pipe(gulp.dest(OUTPUT_DIR + '/answer_generator_content/' + mod + '/debug_scripts/'))
    .pipe(livereload());
  });
});

gulp.task('watch-content-scripts', function () {
  livereload.listen();
  gulp.watch(SOURCE_DIR + '/answer_generators/**/scripts/*.js',
    ['debug-process-content-scripts']);

  gulp.watch(SOURCE_DIR + '/answer_generators/**/*.scss',
    ['sass']);
});

gulp.task('sass', function () {
  return sass('src/answer_generators/**/*.scss', {
    style: 'compressed'
  }).on('error', sass.logError)
  .pipe(gulp.dest(OUTPUT_DIR + '/answer_generator_content/'));
});

gulp.task('plugin-scripts', function () {
  return gulp.src(
    _.map(['answer_generators', 'content_recognizers', 'triggers'], function (pluginType) {
       return SOURCE_DIR + '/' + pluginType + '/**/*.js';
    }).concat(['!**/scripts/*.js']), {
      base: SOURCE_DIR
    })
    .pipe(plumber())
    .pipe(babel({
      presets: ['es2015'],
      plugins: ["transform-remove-strict-mode"]
    }))
    .pipe(gulp.dest(OUTPUT_DIR + '/plugin_scripts/'));
});

gulp.task('compile-ejs', function () {
  return gulp.src(SOURCE_DIR + '/**/*.ejs')
    .pipe(plumber())
    .pipe(gulpEjs({
      compileDebug: true,
      client: true,
      assignToVariable: false,
      _with: false
    }))
    .pipe(babel({
       presets: [
         ["es2015", { "modules": false }]
       ],
       plugins: ["transform-remove-strict-mode"]
    }))
    .pipe(gulp.dest(OUTPUT_DIR + '/compiled_templates/'));
});

gulp.task('clean', function(cb) {
  del([OUTPUT_DIR], cb);
});

gulp.task('build', ['sass', 'content-scripts']);

gulp.task('default', ['plugin-scripts', 'compile-ejs']);
