rem	electron-packager . --overwrite --platform=win32 --arch=x64 --prune=true --extra-resource="resources/fakemail" --out="..\release-builds"

	npm run dist
rem	cd "../electron-builder/virtual-hosts/";
rem	mv "mac" "Virtual Hosts macOS";
