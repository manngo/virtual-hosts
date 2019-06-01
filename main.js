 'use strict';

//	Modules to control application life and create native browser window
	const stuff = require('electron');
	const {app, BrowserWindow, Menu, MenuItem, shell} = require('electron');
	console.log(require.resolve('electron'))
	const path = require('path');
	const { ipcRenderer } = require('electron');
//	require('electron-reload')(__dirname);

let window;
//console.log({app, BrowserWindow, Menu})
function init() {
	window = new BrowserWindow({
		width: 1400,
		height: 600,
		webPreferences: {
			nodeIntegration: true
		}
	});
	window.setTitle('Edit hosts File');
	var menu=[
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
				{
					label: 'Select All',
				    accelerator: 'CmdOrCtrl+A',
				    click: function (menuItem, focusedWindow) { focusedWindow.webContents.selectAll(); }
				},
				{type:'separator'},
				{
					label: 'Find …',
					accelerator: 'CmdOrCtrl+F',
					click: () => window.webContents.send('FIND', 'Find Text')
				},
				{
					label: 'Find Again',
					accelerator: 'CmdOrCtrl+G',
					click: () => window.webContents.send('FINDAGAIN', 'Find Again')
				},
			]
		},
		{
		    role: 'help',
		    submenu: [
				{
					label: 'About …',
					click: () => window.webContents.send('ABOUT', 'About …')
				},
				{
					label: 'Edit Hosts Home',
//					icon: 'images/external.png',
					click: () => {
						shell.openExternal('https://github.com/manngo/edit-hosts');
					}
				},
				{
					label: 'Internotes Virtual Hosts',
//					icon: 'images/external.png',
					click: () => {
						shell.openExternal('https://www.internotes.site/virtual-hosts');
					}
				},
			]
		}

    ];
	menu=Menu.buildFromTemplate(menu);

	var developmentMenu=[{
		label: 'Development',
//		before: 'Help',
		submenu: [
			{
				label: 'Show Development Tools',
				click: function (menuItem, focusedWindow) { window.webContents.openDevTools(); }
			},
			{
				label: 'Show Development Detached',
				click: function (menuItem, focusedWindow) { window.webContents.openDevTools({mode: 'detach'}); }
			},
		]
	}];

//	menuTemplate.push(developmentMenu);

	developmentMenu=Menu.buildFromTemplate(developmentMenu);

	Menu.setApplicationMenu(menu);

//	window.loadFile('index.html');
	window.loadURL(path.join('file://', __dirname, '/index.html'));
//	window.webContents.setDevToolsWebContents(devtools.webContents);
//	window.webContents.openDevTools();

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
