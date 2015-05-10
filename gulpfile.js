/*jslint node: true, continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
var _ = require('lodash');
var gulp = require('gulp');
var ejs = require('gulp-ejs-precompiler');
var plumber = require('gulp-plumber');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var sass = require('gulp-ruby-sass');
var del = require('del');
var SOURCE_DIR = 'src';
var OUTPUT_DIR = 'build';

var ANSWER_GENERATOR_MODULES = {
  calculator: {
    scripts: ['ideadeviate_calculator']
  },
  graphr: {
    scripts: ['util', 'calc', 'parser', 'jsgcalc', 'jsgui']
  },
  leaflet: {
    scripts: ['leaflet-providers', 'leaflet']    
  }
};

gulp.task('scripts', function () {
  Object.keys(ANSWER_GENERATOR_MODULES).forEach(function (mod) {
    var descriptor = ANSWER_GENERATOR_MODULES[mod];
    return gulp.src(
      _.map(descriptor.scripts, function (f) {
         return SOURCE_DIR + '/answer_generators/' + mod + '/scripts/' + f + '.js';
      }))
    .pipe(concat(mod + '.js'))
    .pipe(uglify())
    .pipe(gulp.dest(OUTPUT_DIR + '/answer_generators/' + mod + '/scripts/'));
  });

  return gulp.src(
    _.map(['content_recognizers', 'triggers'], function (pluginType) {
       return SOURCE_DIR + '/' + pluginType + '/*/*.js';
    }), {
      base: SOURCE_DIR
    })
  .pipe(uglify())
  .pipe(gulp.dest(OUTPUT_DIR));
});

gulp.task('sass', function () {
  return gulp.src('src/answer_generators/**/*.scss')
  .pipe(sass({
    style: 'compressed'
  }))
  .pipe(gulp.dest(OUTPUT_DIR + '/answer_generators/'));
});

gulp.task('checkejs', function () {
  var s = gulp.src(SOURCE_DIR + '/**/*.ejs')
    .pipe(plumber())
    .pipe(ejs({
      compileDebug: true,
      client: true
    }))
    .pipe(gulp.dest(OUTPUT_DIR + '/compiled_templates/'));
});

gulp.task('clean', function(cb) {
  del([OUTPUT_DIR], cb);
});

gulp.task('build', ['sass', 'scripts']);


gulp.task('default', ['checkejs']);
