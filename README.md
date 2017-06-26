# vscode-explorer-git-status
Color highlight git added, modified and ignored files inside Visual Studio File Explorer.

- New files are displayed in ![#32CD32](https://placehold.it/15/32CD32/000000?text=+) green.
- Modified files are displayed in ![#FF8C00](https://placehold.it/15/FF8C00/000000?text=+) orange.
- Ignored files are displayed in ![#DCDCDC](https://placehold.it/15/DCDCDC/000000?text=+) gray.

![alt text](https://karabaja4.blob.core.windows.net/public/gitstatus2.png)

You can modify the colors inside the source coe.

# About

**WARNING**: This is NOT an extension. Because this code modifies Visual Studio Code's GUI, it has to manually be appended to Visual Studio Code's internal files which is not officially supported and not recommended for novice users. If you don't feel comfortable modifying Visual Studio Code's internal files please don't use this. I am not responsible for any damage.

# Installation

Open this file as administrator in your favorite text editor (make sure to make a backup of this file beforehand):

`{VS Code directory}\resources\app\out\vs\workbench\electron-browser\workbench.main.js`

copy the code from `dist.min.js` to the end of the file and restart Visual Studio Code. Done!

You will need to do this on every Visual Studio Code update as `workbench.main.js` will be replaced with a newer version.

After installation you will get a warning that your Visual Studio Code installation is corrupt:

![alt text](https://karabaja4.blob.core.windows.net/public/reinstall.jpg)

This is because Visual Studio Code does a background check to detect if the installation has been changed on disk, and displays a warning if it detects any third party modifications. You can permanently hide this warning by clicking `Don't show again`.

Read more about this here: https://code.visualstudio.com/docs/supporting/FAQ#_installation-appears-to-be-corrupt
