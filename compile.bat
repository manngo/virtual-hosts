#	electron-packager . --overwrite --platform=win32 --arch=x64 --prune=true --extra-resource="resources/fakemail" --out="..\release-builds"

	npm run dist
	cd "../electron-builder/edit-virtual-hosts/";
	mv "mac" "Edit Virtual Hosts macOS";
