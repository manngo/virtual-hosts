rm -rf ../release-builds/*;

electron-packager . --overwrite --platform=darwin --arch=x64 --prune=true --out="../release-builds/" --icon ./images/edit-virtual-hosts.icns;
electron-packager . --overwrite --platform=win32 --arch=x64 --prune=true --out="../release-builds" --icon images/edit-virtual-hosts.ico;

cd "../release-builds";

mv "Edit Virtual Hosts-darwin-x64" "Edit Virtual Hosts MacOS";
mv "Edit Virtual Hosts-win32-x64" "Edit Virtual Hosts Windows";

zip -r -X "Edit Virtual Hosts MacOS.zip" "Edit Virtual Hosts MacOS/";
zip -r -X "Edit Virtual Hosts Windows.zip" "Edit Virtual Hosts Windows/";

cd ..
