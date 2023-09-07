#	rm -rf ../release-builds/*;

#	electron-packager . --overwrite --platform=darwin --arch=x64 --prune=true --extra-resource="resources/fakemail" --out="../release-builds/" --icon ./images/virtual-hosts.icns;
#	electron-packager . --overwrite --platform=win32 --arch=x64 --prune=true --out="../release-builds" --icon images/virtual-hosts.ico;

#	cd "../release-builds";

#	mv "Virtual Hosts-darwin-x64" "Virtual Hosts MacOS";
#	mv "Virtual Hosts-win32-x64" "Virtual Hosts Windows";

#	zip -r -X "Virtual Hosts MacOS.zip" "Virtual Hosts MacOS/";
#	zip -r -X "Virtual Hosts Windows.zip" "Virtual Hosts Windows/";

#	npm run dist
	npx electron-builder -m --x64 --arm64 --publish never
	cd "../electron-builder/virtual-hosts/";
#	mv "mac" "Virtual Hosts macOS";
#	mv "mac" "Virtual Hosts macOS";




cd ..

echo Compiled at: `date`
