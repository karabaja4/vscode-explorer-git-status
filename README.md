# vscode-explorer-git-status
Highlighting of git added, modified and ignored files inside Visual Studio File Explorer (similar to Atom).

![alt text](https://karabaja4.blob.core.windows.net/public/gitstatus2.png)

You can modify the colors inside the `dist.min.js` source, or modify them in `dev.js` and reminify the file.

# About

**WARNING**: This is NOT an extension. Because this code is basically a hack that modifies Visual Studio Code's GUI, it has to manually be appended to Visual Studio Code's internal files which is not officially supported and not recommended for novice users. If you don't feel comfortable modifying Visual Studio Code's internal files please don't use this. I am not responsible for any damage.

# Installation

Open this file as administrator in your favorite text editor (make sure to make a backup of this file beforehand):

`{VS Code directory}\resources\app\out\vs\workbench\electron-browser\workbench.main.js`

copy the code from `dist.min.js` to the end of the file and restart Visual Studio Code. Done!

You will need to do this on every Visual Studio Code update as `workbench.main.js` will be replaced with a newer version.

After installation you will get a warning that your Visual Studio Code installation is corrupt:

![alt text](https://karabaja4.blob.core.windows.net/public/reinstall.jpg)

This is because Visual Studio Code does a background check to detect if the installation has been changed on disk, and displays a warning if it detects any third party modifications. You can permanently hide this warning by clicking `Don't show again`.

Read more about this here: https://code.visualstudio.com/docs/supporting/FAQ#_installation-appears-to-be-corrupt
