# vscode-explorer-git-status
Highlighting of git added, modified and ignored files inside Visual Studio Code File Explorer (similar to Atom).

Screenshot:

![alt text](https://karabaja4.blob.core.windows.net/public/gitstatus3.png)

You can modify the colors inside the `dist.min.js` source, or modify them in `dev.js` and reminify the file.

# Change Log

```
28.6.2017: Fixed a bug where plugin would not load when reopening the project.
30.6.2017: Added highlighting of parent directories of modified files (as Atom does).
1.7.2017: File matching is now done using full file or directory path. Before this change the directory was highlighted if it had the same name as another changed directory.
11.8.2017: Update README where to find the file for VS Code >= 1.15.
12.8.2017: Added automatic installation method.
```

# About

**WARNING**: This is NOT an extension. Because this code is basically a hack that modifies Visual Studio Code's GUI, it has to manually be appended to Visual Studio Code's internal files which is not officially supported and not recommended for novice users. If you don't feel comfortable modifying Visual Studio Code's internal files please don't use this. I am not responsible for any damage.

# Installation

## Automatic

This method requires VS Code **>= 1.15** installed in the default installation directory. Otherwise, use the manual method.

Run the following commands:

```shell
npm install
gulp install # as root/administrator
```

A gulp task will automatically locate `workbench.min.js`, make a backup and append the code. Done!

## Manual

Open the following file:

```shell
{VS Code directory}/resources/app/out/vs/workbench/workbench.main.js (>= VS Code 1.15)
{VS Code directory}/resources/app/out/vs/workbench/electron-browser/workbench.main.js (< VS Code 1.15)
```

as an administrator (or root) in your favorite text editor (make sure to make a backup of this file beforehand).

Copy the code from `dist.min.js` to the **end of the file** and restart Visual Studio Code. Done!

## Notes

You will need to repeat the installation process on every Visual Studio Code update as `workbench.main.js` will be replaced with a newer version.

After installation you will get a warning that your Visual Studio Code installation is corrupt:

![alt text](https://karabaja4.blob.core.windows.net/public/corrupted.png)

This is because Visual Studio Code does a background check to detect if the installation has been changed on disk, and displays a warning if it detects any third party modifications. You can permanently hide this warning by clicking `Don't show again`.

Read more about this here: https://code.visualstudio.com/docs/supporting/FAQ#_installation-appears-to-be-corrupt
