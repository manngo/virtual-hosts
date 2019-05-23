// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron');
const path = require('path');


let mainWindow;

function createWindow () {
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true
		}
	});
//	mainWindow.loadFile('index.html');
	mainWindow.loadURL(path.join('file://', __dirname, '/index.html'));
//	mainWindow.loadURL('/etc/hosts');
//	mainWindow.webContents.setDevToolsWebContents(devtools.webContents);
//	mainWindow.webContents.openDevTools({mode: 'detach'});

	mainWindow.on('closed', function () {
		mainWindow = null;
  	});
}

app.on('ready', createWindow);
app.on('window-all-closed', function () {
	//	if (process.platform !== 'darwin')
	app.quit();
});

app.on('activate', function () {
  	if (mainWindow === null) createWindow();
});
