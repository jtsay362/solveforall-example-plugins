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

gulp.task('scripts', function () { 
  return gulp.src(
    _.map(['util', 'calc', 'parser', 'jsgcalc', 'jsgui'], function (f) {
       return SOURCE_DIR + '/answer_generators/graphr/scripts/' + f + '.js'
    }))
  .pipe(concat('graphr.js'))
  .pipe(uglify())
  .pipe(gulp.dest(OUTPUT_DIR + '/answer_generators/graphr/scripts/'));
});

gulp.task('sass', function () {
  return gulp.src('src/**/*.scss')
  .pipe(sass({    
    style: 'compressed'
  }))
  .pipe(gulp.dest(OUTPUT_DIR));        
});

gulp.task('checkejs', function () {
  var s = gulp.src(SOURCE_DIR + '/**/*.ejs') 
    .pipe(plumber())
    .pipe(ejs({
      compileDebug: true,
      client: true
    }))
    .pipe(gulp.dest(OUTPUT_DIR + '/compiled_templates'));
});

gulp.task('clean', function(cb) {
  del([OUTPUT_DIR], cb);
});

gulp.task('build', ['sass', 'scripts']);


gulp.task('default', ['checkejs']);