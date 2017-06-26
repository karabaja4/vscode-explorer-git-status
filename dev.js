function injectGitFileStatus()
{
    const explorer = document.getElementById("workbench.view.explorer");

    const timeout = 5000;
    const addedColor = "limegreen";
    const modifiedColor = "darkorange";
    const ignoredOpacity = "0.4";

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

                        const gitRoot = path.normalize(path.dirname(explorerItem.getAttribute("title")));

                        const style = document.createElement("style");
                        document.body.appendChild(style);

                        const startGitStatusChecks = () =>
                        {
                            // run git status
                            const command = "git status --short --ignored";

                            const options =
                            {
                            cwd: gitRoot
                            };

                            const callback = (error, stdout, stderr) =>
                            {
                                if (!error)
                                {
                                    const files = stdout.split("\n");

                                    const addedSymbol = "?? ";
                                    const modifiedSymbol = " M ";
                                    const deletedSymbol = "!! ";

                                    const normalize = (name) =>
                                    {
                                        return path.normalize(name.substr(3)).replace(/\\+$/, "").replace(/\/+$/, "").replace(/\\/g, "\\\\");
                                    };

                                    const added = files.filter(name => { return name.startsWith("?? "); }).map(name => { return normalize(name); });
                                    const modified = files.filter((name) => { return name.startsWith(" M "); }).map(name => { return normalize(name); });
                                    const deleted = files.filter((name) => { return name.startsWith("!! "); }).map(name => { return normalize(name); });

                                    let html = "";
                                    const classPath = "#workbench\\.view\\.explorer .explorer-folders-view .monaco-tree .monaco-tree-rows .monaco-tree-row .explorer-item";

                                    added.forEach(addedFile =>
                                    {
                                        html += `${classPath}[title$="${addedFile}" i]{color:${addedColor};}`
                                    });

                                    modified.forEach(modifiedFile =>
                                    {
                                        html += `${classPath}[title$="${modifiedFile}" i]{color:${modifiedColor};}`
                                    });

                                    deleted.forEach(deletedFile =>
                                    {
                                        html += `${classPath}[title$="${deletedFile}" i]{opacity:${ignoredOpacity};}`
                                    });

                                    if (style.innerHTML != html)
                                    {
                                        style.innerHTML = html;
                                    }
                                }

                                setTimeout(startGitStatusChecks, timeout);
                            }

                            exec(command, options, callback);
                        }

                        startGitStatusChecks();

                        // loaded
                        return;
                    }
                }
            }
        }
    }

    setTimeout(injectGitFileStatus, timeout);
}

injectGitFileStatus();