
const gulp = require("gulp");
const uglifyjs = require("uglify-es");
const composer = require("gulp-uglify/composer");
const pump = require("pump");
const rename = require("gulp-rename");
const path = require("path");
const insert = require("gulp-insert");
const fs = require("fs");
const minify = composer(uglifyjs, console);
const cp = require('child_process');
const os = require('os');
var gutil = require('gulp-util');

function get_code_directory_paths(cb)
{
    const fail = new Error("Could not locate Code binary. Please install the script manually.");
    const windows = () =>
    {
        cp.exec("where code", (error, stdout, stderr) => // windows
        {
            if (error || stderr || !stdout)
            {
                cb(fail, null);
            }
            else
            {
                // C:\Users\igors>where Code
                // C:\Program Files\Microsoft VS Code\bin\code
                // C:\Program Files\Microsoft VS Code\bin\code.cmd
                cb(null, stdout.split(/\r?\n/).filter(i => i).map(i => path.dirname(path.dirname(i))));
            }
        });
    }

    const linux = () =>
    {
        cp.exec("whereis code", (error, stdout, stderr) => // linux, mac
        {
            if (error || stderr || !stdout)
            {
                cb(fail, null);
            }
            else
            {
                // dev@devbian:~/vscode-explorer-git-status$ whereis code
                // code: /usr/bin/code /usr/share/code
                cb(null, stdout.split(/\s+/).map(i => i.replace("code:", "")).filter(i => i));
            }
        });
    }

    if (os.platform() === "win32")
    {
        windows();
    }
    else
    {
        linux();
    }
}

function get_workbench_path(cb)
{
    const fail = new Error("Could not locate workbench.main.js or you do not have sufficient permissions.");
    get_code_directory_paths((err, dirs) =>
    {
        if (!err)
        {
            let called = false;
            let processing = dirs.slice();

            dirs.forEach(dir =>
            {
                const workbench = path.join(dir, "/resources/app/out/vs/workbench/workbench.main.js");
                const callback = (err, wb) =>
                {
                    if (!called)
                    {
                        called = true;
                        cb(err, wb);
                    }
                };

                const accessed = (err) =>
                {
                    if (!err)
                    {
                        callback(err, workbench);
                    }
                    else
                    {
                        processing.pop();
                        if (processing.length == 0)
                        {
                            callback(fail, null);
                        }
                    }
                };

                fs.access(workbench, fs.constants.R_OK | fs.constants.W_OK, accessed);
            });
        }
        else
        {
            cb(err, null);
        }
    });
}

gulp.task("minify", (cb) =>
{
    pump([ gulp.src("dev.js"), minify(), rename("dist.min.js"), gulp.dest("./") ], cb);
});

gulp.task("install", ["minify"], (cb) =>
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
            ], cb);
        }
        else
        {
            cb(err);
        }
    });
});