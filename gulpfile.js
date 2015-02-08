var gulp = require('gulp');
var ejs = require('gulp-ejs-precompiler');
var plumber = require('gulp-plumber');
var SOURCE_DIR = 'src';
var OUTPUT_DIR = 'build';

gulp.task('checkejs', function () {
  var s = gulp.src(SOURCE_DIR + '/**/*.ejs') 
    .pipe(plumber())
    .pipe(ejs({
      compileDebug: true,
      client: true
    }))
    .pipe(gulp.dest(OUTPUT_DIR + '/compiled_templates'));
});

gulp.task('default', ['checkejs']);