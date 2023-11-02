 'use strict';

//	Settings

	const {DEVELOPMENT}=require('./settings.js');
	if(DEVELOPMENT && process.platform == 'darwin') require('electron-reload')(__dirname);

//	Required Modules
	//	const {app, BrowserWindow, Menu, MenuItem, shell, ipcRenderer, protocol} = require('electron');
	const {app, BrowserWindow, Menu, MenuItem, shell, ipcRenderer, protocol, ipcMain, dialog} = require('electron');

	//	console.log(require.resolve('electron'))
	const path = require('path');

//	Global Variables
	var window, menu;

//	Menu
	//	click: function (menuItem, focusedWindow) { focusedWindow.webContents.undo(); }

	function send(menuItem) {
		window.webContents.send('MENU',menuItem.id);
	}

	menu=[
        {
            label: 'Virtual Hosts',
            submenu: [
                {	label: `New Document`, accelerator: 'CmdOrCtrl+N', id:'NEW', click: send },
                {	label: `Open …`, accelerator: 'CmdOrCtrl+O', id:'OPEN', click: send },
                {	label: `Reload`, accelerator: 'CmdOrCtrl+R', id:'RELOAD', click: send },
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
				{	label: 'Virtual Hosts Home', icon: path.join(__dirname, 'images/external.png'), click: () => { shell.openExternal('https://github.com/manngo/virtual-hosts'); } },
				{	label: 'Internotes Virtual Hosts', icon: path.join(__dirname,'images/external.png'), click: () => { shell.openExternal('https://www.internotes.net/virtual-hosts'); } },
				{	id: 'debug-separator', type:'separator' },
				{	id: 'debug-developer-tools', accelerator: 'CmdOrCtrl+Shift+I', label: 'Show Development Tools', click: function (menuItem, focusedWindow) { window.webContents.openDevTools({mode: 'detach'}); } },
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
				nodeIntegration: true,
      			contextIsolation: false,
      			enableRemoteModule: true,
			}
		});

	protocol.registerStringProtocol('doit',(request,callback)=>{
		var [dummy,action,data,more]=decodeURI(request.url).split(/:/);
		window.webContents.send('DOIT',action,data,more);
	},(error)=> {});

		window.once('ready-to-show', () => {
			window.show();
		});

		window.setTitle('Virtual Hosts');
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

	ipcMain.on('open-path',(event,options,returnMessage)=>{
		options.properties=['openDirectory'];
		openDialog(event,options,returnMessage);
	});
	ipcMain.on('open-file',(event,options,returnMessage)=>{
		openDialog(event,options,returnMessage);
	});
	function openDialog(event,options,returnMessage) {
		dialog.showOpenDialog(null, options).then(result => {
	    	event.sender.send(returnMessage, result);
	    });
	}

	ipcMain.on('home',(event,options) => {
		var home=`${app.getPath('home')}`;
		event.returnValue = home;
	});
	ipcMain.on('init',(event,data) => {
		var home = `${app.getPath('home')}`;
		event.returnValue = JSON.stringify({home});
	});
	ipcMain.on('app-path',(event,options)=>{
		var home=`${app.getAppPath()}`;
		event.returnValue = home;
	});
