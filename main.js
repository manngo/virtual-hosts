 'use strict';

//	Settings

	const {DEVELOPMENT}=require('./settings.js');
	if(DEVELOPMENT && process.platform == 'darwin')
	if(DEVELOPMENT) require('electron-reload')(__dirname);

//	Required Modules
	const {app, BrowserWindow, Menu, MenuItem, shell, ipcRenderer} = require('electron');
	//	console.log(require.resolve('electron'))
	const path = require('path');

//	Global Variables
	var window, menu;

//	Menu
	//	click: function (menuItem, focusedWindow) { focusedWindow.webContents.undo(); }

	function send(menuItem) {
		window.webContents.send('DOIT',menuItem.id);
	}

	menu=[
        {
            label: 'Edit hosts File',
            submenu: [
                {	label: `New Document`, accelerator: 'CmdOrCtrl+N', id:'NEW', click: send },
                {	label: `Open …`, accelerator: 'CmdOrCtrl+O', id:'OPEN', click: send },
                {	label: `Reload`, accelerator: 'CmdOrCtrl+R', id:'LOAD', click: send },
                {	label: `Save`, accelerator: 'CmdOrCtrl+S', id:'SAVE', click: send },
                {	label: `Save As …`, accelerator: 'CmdOrCtrl+Shift+S', id:'SAVEAS', click: send },
				{	type:'separator' },
                {	role: `quit`, accelerator: 'CmdOrCtrl+Q' }
            ]
        },
		{
			label: 'Edit',
			submenu: [
				{	role: 'undo', accelerator: 'CmdOrCtrl+Z' },
				{	role: 'redo', accelerator: 'CmdOrCtrl+Shift+Z' },
				{	type:'separator'},
				{	role: 'cut', accelerator: 'CmdOrCtrl+X' },
				{	role: 'copy', accelerator: 'CmdOrCtrl+C' },
				{	role: 'paste', accelerator: 'CmdOrCtrl+V' },
				{	role: 'selectAll', accelerator: 'CmdOrCtrl+A' },
				{	type:'separator' },
				{	label: 'Find …', accelerator: 'CmdOrCtrl+F', id: 'FIND', click: send },
				{	label: 'Find Again', accelerator: 'CmdOrCtrl+G', id:'FINDAGAIN', click: send },
			]
		},
		{
		    role: 'help',
		    submenu: [
				{	label: 'About …', id: 'ABOUT', click: send },
				{	label: 'Instructions …', id: 'INSTRUCTIONS', click: send },
				{	type:'separator' },
				{	label: 'Edit Hosts Home', icon: path.join(__dirname, 'images/external.png'), click: () => { shell.openExternal('https://github.com/manngo/edit-hosts'); } },
				{	label: 'Internotes Virtual Hosts', icon: path.join(__dirname,'images/external.png'), click: () => { shell.openExternal('https://www.internotes.site/virtual-hosts'); }
				},
			]
		}
    ];

	var developmentMenu=[{
		label: 'Development',
		submenu: [
			{	label: 'Show Development Tools', click: function (menuItem, focusedWindow) { window.webContents.openDevTools(); } },
			{	label: 'Show Development Detached', click: function (menuItem, focusedWindow) { window.webContents.openDevTools({mode: 'detach'}); } },
		]
	}];

if(DEVELOPMENT) 	menu=menu.concat(developmentMenu);

//	Init

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

//	Events

	app.on('ready', init);
	app.on('window-all-closed', function () {
		//	if (process.platform !== 'darwin')
		app.quit();
	});
	app.on('activate', function () {
	  	if (window === null) init();
	});
