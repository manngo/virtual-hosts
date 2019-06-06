 'use strict';

	const {DEVELOPMENT}=require('./settings.js');
	if(DEVELOPMENT)	require('electron-reload')(__dirname);

//	Modules to control application life and create native browser window
	const {app, BrowserWindow, Menu, MenuItem, shell, ipcRenderer} = require('electron');
//	console.log(require.resolve('electron'))
	const path = require('path');

let window;

function init() {
	window = new BrowserWindow({
		width: 1200,
		height: 800,
		webPreferences: {
			nodeIntegration: true
		}
	});
	window.once('ready-to-show', () => {
		window.show();
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
				{
					role: 'redo',
					accelerator: 'CmdOrCtrl+Shift+Z',
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
					icon: path.join(__dirname, 'images/external.png'),
					click: () => {
						shell.openExternal('https://github.com/manngo/edit-hosts');
					}
				},
				{
					label: 'Internotes Virtual Hosts',
					icon: path.join(__dirname,'images/external.png'),
					click: () => {
						shell.openExternal('https://www.internotes.site/virtual-hosts');
					}
				},
			]
		}
    ];

	var developmentMenu=[{
		label: 'Development',
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

	menu=menu.concat(developmentMenu);
	menu=Menu.buildFromTemplate(menu);

	Menu.setApplicationMenu(menu);

	window.loadURL(path.join('file://', __dirname, '/index.html'));
//	if(DEVELOPMENT) window.webContents.openDevTools({mode: 'detach'});
	if(DEVELOPMENT) window.webContents.openDevTools();

//	window.webContents.setDevToolsWebContents(devtools.webContents);

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
