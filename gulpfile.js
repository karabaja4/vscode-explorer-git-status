
const gulp = require("gulp");
const uglifyjs = require('uglify-es');
const composer = require('gulp-uglify/composer');
const pump = require('pump');
const rename = require('gulp-rename');
const whereis = require('whereis');
const path = require('path');
const insert = require('gulp-insert');
const fs = require("fs");

const minify = composer(uglifyjs, console);

gulp.task('minify', (cb) =>
{
    pump([ gulp.src('dev.js'), minify(), rename("dist.min.js"), gulp.dest('./') ], cb);
});

gulp.task('install', ['minify'], (cb) =>
{
    whereis("code", (err, binpath) =>
    {
        const vscodeBinDir = binpath.split(/\r?\n/).filter(i => i)[0];
        const workbench = path.join(path.dirname(vscodeBinDir), "/../resources/app/out/vs/workbench/workbench.main.js");
        const code = fs.readFileSync("dist.min.js");

        pump([ gulp.src(workbench),
               rename("workbench.main.js." + Date.now()),
               gulp.dest(path.dirname(workbench)),
               rename("workbench.main.js"),
               insert.append(code),
               gulp.dest(path.dirname(workbench)) ]);
    });
});