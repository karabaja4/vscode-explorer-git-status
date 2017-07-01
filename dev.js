function injectGitFileStatus()
{
    const timeout = 5000;
    const addedColor = "limegreen";
    const modifiedColor = "darkorange";
    const ignoredOpacity = "0.4";

    const explorer = document.getElementById("workbench.view.explorer");
    if (explorer)
    {
        const foldersView = explorer.getElementsByClassName("explorer-folders-view")[0];
        if (foldersView)
        {
            const tree = foldersView.getElementsByClassName("monaco-tree")[0];
            if (tree)
            {
                const firstRow = tree.getElementsByClassName("monaco-tree-row")[0];
                if (firstRow)
                {
                    const explorerItem = firstRow.getElementsByClassName("explorer-item")[0];
                    if (explorerItem)
                    {
                        const path = require("path");
                        const exec = require("child_process").exec;

                        const style = document.createElement("style");
                        document.body.appendChild(style);

                        const resolveHome = (filepath) =>
                        {
                            if (filepath[0] === "~")
                            {
                                return path.join(process.env.HOME, filepath.slice(1));
                            }

                            return filepath;
                        }

                        const unresolveHome = (filepath) =>
                        {
                            const home = process.env.HOME;
                            if (home && filepath.startsWith(home))
                            {
                                var regex = new RegExp(`^${home}`);
                                return filepath.replace(regex, "~");
                            }
                            else
                            {
                                return filepath;
                            }
                        }

                        const firstFileDir = path.normalize(path.dirname(explorerItem.getAttribute("title")));

                        const gitRootCommand = "git rev-parse --show-toplevel";
                        const gitRootOptions = { cwd: resolveHome(firstFileDir) };
                        const gitRootCallback = (error, stdout, stderr) =>
                        {
                            if (!error)
                            {
                                const gitRoot = stdout.trim();
                                const startGitStatusChecks = () =>
                                {
                                    // run git status
                                    const gitStatusCommand = "git status --short --ignored";
                                    const gitStatusOptions = { cwd: resolveHome(gitRoot) }

                                    const normalizePath = (name) =>
                                    {
                                        return path.normalize(name.substr(3)).replace(/\\+$/, "").replace(/\/+$/, "").replace(/\\/g, "\\\\");
                                    };
                                    
                                    const getAllSubdirectories = (name) =>
                                    {
                                        let i = 1;
                                        const paths = [];
                                        const sep = path.sep.replace(/\\/g, "\\\\");

                                        while (i = name.indexOf(sep, i) + 1)
                                        {
                                            paths.push(name.substr(0, i - 1));
                                        }

                                        return paths;
                                    };

                                    const classPath = "#workbench\\.view\\.explorer .explorer-folders-view .monaco-tree .monaco-tree-rows .monaco-tree-row .explorer-item";

                                    const getCssEntry = (file, cssEntry) =>
                                    {
                                        const filepath = unresolveHome(path.join(gitRoot, file).replace(/\\/g, "\\\\"));
                                        return `${classPath}[title="${filepath}" i]{${cssEntry}}`;
                                    }

                                    const gitStatusCallback = (error, stdout, stderr) =>
                                    {
                                        if (!error)
                                        {
                                            const files = stdout.split("\n");

                                            const added = files.filter(name => { return name.startsWith("?? "); }).map(name => { return normalizePath(name); });
                                            const modified = files.filter(name => { return name.startsWith(" M "); }).map(name => { return normalizePath(name); });
                                            const ignored = files.filter(name => { return name.startsWith("!! "); }).map(name => { return normalizePath(name); });

                                            let html = "";
    
                                            const addedFolders = new Set();
                                            const modifiedFolders = new Set();

                                            // files
                                            added.forEach(addedFile =>
                                            {
                                                const subdirectories = getAllSubdirectories(addedFile);
                                                subdirectories.forEach(subdirectory =>
                                                {
                                                    addedFolders.add(subdirectory);
                                                });

                                                html += getCssEntry(addedFile, `color:${addedColor};`);
                                            });

                                            modified.forEach(modifiedFile =>
                                            {
                                                const subdirectories = getAllSubdirectories(modifiedFile);
                                                subdirectories.forEach(subdirectory =>
                                                {
                                                    modifiedFolders.add(subdirectory);
                                                });

                                                html += getCssEntry(modifiedFile, `color:${modifiedColor};`);
                                            });

                                            ignored.forEach(ignoredFile =>
                                            {
                                                html += getCssEntry(ignoredFile, `opacity:${ignoredOpacity};`);
                                            });

                                            // folders
                                            addedFolders.forEach((addedFolder) =>
                                            {
                                                html += getCssEntry(addedFolder, `color:${addedColor};`);
                                            });

                                            modifiedFolders.forEach((modifiedFolder) =>
                                            {
                                                html += getCssEntry(modifiedFolder, `color:${modifiedColor};`);
                                            });

                                            if (style.innerHTML !== html)
                                            {
                                                style.innerHTML = html;
                                            }
                                        }

                                        setTimeout(startGitStatusChecks, timeout);
                                    }

                                    exec(gitStatusCommand, gitStatusOptions, gitStatusCallback);
                                }

                                startGitStatusChecks();
                            }
                        }

                        exec(gitRootCommand, gitRootOptions, gitRootCallback);

                        // loaded
                        return;
                    };
                }
            }
        }
    }

    setTimeout(injectGitFileStatus, timeout);
}

injectGitFileStatus();