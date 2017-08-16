const gulp = require("gulp");
const uglifyjs = require("uglify-es");
const composer = require("gulp-uglify/composer");
const pump = require("pump");
const rename = require("gulp-rename");
const path = require("path");
const insert = require("gulp-insert");
const fs = require("fs");
const minify = composer(uglifyjs, console);
const gutil = require('gulp-util');
const lines = require('read-last-lines');

function get_workbench_path(callback)
{
    const resourcesPaths = [
        "C:\\Program Files\\Microsoft VS Code\\resources", // win64
        "C:\\Program Files (x86)\\Microsoft VS Code\\resources", //win32
        "/Applications/Visual Studio Code.app/Contents/Resources", // mac
        "/usr/share/code/resources" // linux
    ];

    const potentials = [];
    resourcesPaths.forEach(x =>
    {
        potentials.push(path.join(x, "/app/out/vs/workbench/workbench.main.js"));
    });

    const processing = potentials.slice();
    let found = false;

    const accessed = (err, workbench) =>
    {
        if (!found)
        {
            if (!err)
            {
                found = true;
                lines.read(workbench, 1).then((line) =>
                {
                    if (line.startsWith("function injectGitFileStatus()"))
                    {
                        callback(new Error("vscode-explorer-git-status is already installed."), null);
                    }
                    else
                    {
                        callback(err, workbench);
                    }
                });
            }
            else
            {
                processing.pop();
                if (processing.length == 0)
                {
                    found = true;
                    callback(new Error("Could not locate workbench.main.js or you do not have sufficient permissions.", null));
                }
            }
        }
    };

    potentials.forEach(x =>
    {
        fs.access(x, fs.constants.R_OK | fs.constants.W_OK, (err) => accessed(err, x));
    });
}

gulp.task("minify", (callback) =>
{
    pump([ gulp.src("dev.js"), minify(), rename("dist.min.js"), gulp.dest("./") ], callback);
});

gulp.task("install", ["minify"], (callback) =>
{
    get_workbench_path((err, workbench) =>
    {
        if (!err && workbench)
        {
            gutil.log("Installing to " + workbench);

            const code = fs.readFileSync("dist.min.js");
            pump([ gulp.src(workbench),
                    rename("workbench.main.js." + Date.now()),
                    gulp.dest(path.dirname(workbench)),
                    rename("workbench.main.js"),
                    insert.append(code),
                    gulp.dest(path.dirname(workbench))
            ], callback);
        }
        else
        {
            callback(err);
        }
    });
});