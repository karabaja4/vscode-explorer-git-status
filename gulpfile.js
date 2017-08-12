
let gulp = require("gulp");
var uglifyjs = require('uglify-es');
var composer = require('gulp-uglify/composer');
var pump = require('pump');
var rename = require('gulp-rename');

var minify = composer(uglifyjs, console);

gulp.task('minify', function (cb) {
  pump([
      gulp.src('dev.js'),
      minify(),
      rename("dist.min.js"),
      gulp.dest('./')
    ],
    cb
  );
});