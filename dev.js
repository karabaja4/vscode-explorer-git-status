function injectGitFileStatus() {
    const path = require("path");
    const exec = require("child_process").exec;

    const resolveHome = (filepath) => {
        if (filepath[0] === "~") {
            return path.join(process.env.HOME, filepath.slice(1));
        }

        return filepath;
    }

    const unresolveHome = (filepath) => {
        const home = process.env.HOME;
        if (home && filepath.startsWith(home)) {
            const regex = new RegExp(`^${home}`);
            return filepath.replace(regex, "~");
        }
        else {
            return filepath;
        }
    }

    const normalizePath = (name) => {
        return path.normalize(name.substr(3)).replace(/\\+$/, "").replace(/\/+$/, "").replace(/\\/g, "\\\\");
    };

    const getAllSubdirectories = (name) => {
        let i = 1;
        const paths = [];
        const sep = path.sep.replace(/\\/g, "\\\\");

        while (i = name.indexOf(sep, i) + 1) {
            paths.push(name.substr(0, i - 1));
        }

        return paths;
    };


    const timeout = 5000;
    const addedColor = "#32ff32";
    const modifiedColor = "#fffc32";
    const ignoredOpacity = "0.4";
    const style = document.createElement("style");
    document.body.appendChild(style);


    const classPath = "#workbench\\.view\\.explorer .explorer-folders-view .monaco-tree .monaco-tree-rows .monaco-tree-row .explorer-item";

    const getCssEntry = (root, file, cssEntry, rec) => {
        const filepath = unresolveHome(path.join(root, file).replace(/\\/g, "\\\\"));
        if(rec)
            return `${classPath}[title^="${filepath}" i]{${cssEntry}}` + '\r\n';
        return `${classPath}[title="${filepath}" i]{${cssEntry}}` + '\r\n';
    }

    async function getGitRoot(firstFileDir) {
        const gitRootCommand = "git rev-parse --show-toplevel";
        const gitRootOptions = { cwd: resolveHome(firstFileDir) };

        return new Promise((resolve, reject) => {
            exec(gitRootCommand, gitRootOptions, (error, stdout, stderr) => error ? reject(error) : resolve(stdout.trim()));
        })
    }

    let preGitRoot, preGitStatus;

    async function getGitStatus(gitRoot) {
        const gitStatusCommand = "git status --short --ignored";
        const gitStatusOptions = { cwd: resolveHome(gitRoot) }

        const stdout = await new Promise((resolve, reject) => {
            exec(
                gitStatusCommand,
                gitStatusOptions,
                (error, stdout, stderr) => error ? reject(error) : resolve(stdout)
            )
        })

        const files = stdout.split("\n");

        const added = files
            .filter(name => name.startsWith("?? "))
            .map(name => normalizePath(name));

        const modified = files
            .filter(name => name.startsWith(" M "))
            .map(name => normalizePath(name));

        const ignored = files
            .filter(name => name.startsWith("!! "))
            .map(name => normalizePath(name));

        return { added, modified, ignored, stdout }

    }

    async function run() {


        const explorer = document.getElementById("workbench.view.explorer");
        const foldersView = explorer && explorer.getElementsByClassName("explorer-folders-view")[0];
        const tree = foldersView && foldersView.getElementsByClassName("monaco-tree")[0];
        const firstRow = tree && tree.getElementsByClassName("monaco-tree-row")[0];
        const explorerItem = firstRow && firstRow.getElementsByClassName("explorer-item")[0];


        if (explorerItem) {

            const firstFileDir = path.normalize(path.dirname(explorerItem.getAttribute("title")));

            const gitRoot = preGitRoot || (preGitRoot = await getGitRoot(firstFileDir))

            const { added, modified, stdout } = await getGitStatus(gitRoot)

            if (stdout == preGitStatus) {
                setTimeout(run, timeout);
                return
            }

            preGitStatus = stdout;

            const addedFolders = new Set();
            const modifiedFolders = new Set();

            let html = "";

            for (let file of added) {

                for (let subdir of getAllSubdirectories(file))
                    addedFolders.add(subdir)

                html += getCssEntry(gitRoot, file, `color:${addedColor};`,true);
            }

            for (let file of modified) {

                for (let subdir of getAllSubdirectories(file))
                    modifiedFolders.add(subdir)

                html += getCssEntry(gitRoot, file, `color:${modifiedColor};`);
            }

            for (let file of addedFolders)
                html += getCssEntry(gitRoot, file, `color:${addedColor};`);

            for (let file of modifiedFolders)
                html += getCssEntry(gitRoot, file, `color:${modifiedColor};`);


            if (style.innerHTML !== html) {
                style.innerHTML = html;
            }

        };

        setTimeout(run, timeout);
    }



    setTimeout(run, timeout);
};

injectGitFileStatus();