 'use strict';

//	Modules to control application life and create native browser window
	const {app, BrowserWindow, Menu} = require('electron');
	const path = require('path');
	const { ipcRenderer } = require('electron');

	require('electron-reload')(__dirname);

let window;
init();
function init() {
	window = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true
		}
	});
	window.setTitle('Edit hosts File');
	Menu.setApplicationMenu(Menu.buildFromTemplate([
        {
            label: 'Edit hosts File',
            submenu: [
                {
                    label: `Open …`,
					accelerator: 'CmdOrCtrl+O',
                    click: () => window.webContents.send('OPEN', 'Open File')
                },
                {
                    label: `Reload`,
					accelerator: 'CmdOrCtrl+R',
                    click: () => window.webContents.send('LOAD', 'Reload File')
                },
                {
                    label: `Save`,
					accelerator: 'CmdOrCtrl+S',
                    click: () => window.webContents.send('SAVE', 'Save File')
                },
				{type:'separator'},
                {
                    label: `Quit`,
					accelerator: 'CmdOrCtrl+Q',
                    click: () => window.close()
                },
            ]
        },
		{
			label: 'Edit',
			submenu: [
				{
				    label: 'Undo',
				    accelerator: 'CmdOrCtrl+Z',
				    click: function (menuItem, focusedWindow) { focusedWindow.webContents.undo(); }
				},
				{type:'separator'},
				{
					label: 'Cut',
				    accelerator: 'CmdOrCtrl+X',
				    click: function (menuItem, focusedWindow) { focusedWindow.webContents.cut(); }
				},
				{
					label: 'Copy',
				    accelerator: 'CmdOrCtrl+C',
				    click: function (menuItem, focusedWindow) { focusedWindow.webContents.copy(); }
				},
				{
					label: 'Paste',
				    accelerator: 'CmdOrCtrl+V',
				    click: function (menuItem, focusedWindow) { focusedWindow.webContents.paste(); }
				},
				{type:'separator'},
				{
					label: 'Find …',
					accelerator: 'CmdOrCtrl+F',
					click: function(menuItem, focusedWindow) {
						var text='Virtual';
						var result=focusedWindow.webContents.findInPage(text);
					}
				}
			]

		}

    ]));
//	window.loadFile('index.html');
	window.loadURL(path.join('file://', __dirname, '/index.html'));
//	window.webContents.setDevToolsWebContents(devtools.webContents);
	window.webContents.openDevTools({mode: 'detach'});

	window.on('closed', function () {
		window = null;
  	});
}


app.on('ready', init);
app.on('window-all-closed', function () {
	//	if (process.platform !== 'darwin')
	app.quit();
});

app.on('activate', function () {
  	if (window === null) init();
});
