rm -rf release-builds/*;

electron-packager . --overwrite --platform=darwin --arch=x64 --prune=true --out="release-builds/" --icon ./images/edit-hosts.icns;
electron-packager . --overwrite --platform=win32 --arch=x64 --prune=true --out=release-builds --icon images/edit-hosts.ico;

cd release-builds;

mv "Edit Hosts File-darwin-x64" "Edit Hosts File MacOS";
mv "Edit Hosts File-win32-x64" "Edit Hosts File Windows";

zip -r -X "Edit Hosts File MacOS.zip" "Edit Hosts File MacOS/";
zip -r -X "Edit Hosts File Windows.zip" "Edit Hosts File Windows/";

cd ..
