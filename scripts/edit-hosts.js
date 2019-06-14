//	Development
//	const DEVELOPMENT=false;
	const {DEVELOPMENT}=require('../settings.js');
// document.addEventListener('DOMContentLoaded',main,false);

//	Requires
	const path = require('path');
	const fs = require('fs');
	const { ipcRenderer, shell} = require('electron');
	const { dialog } = require('electron').remote;
	const sudo = require('sudo-prompt');
//	const BrowserWindow = require('browser-window');

	const electron=require('electron');

	const remote=electron.remote;
	const app=remote.app;
	const BrowserWindow = remote.BrowserWindow;




	const window=remote.getCurrentWindow();
	window.webContents.on('new-window', function(event, url) {
	  event.preventDefault();
	  shell.openExternal(url);
	});

	const temp=require('temp').track();

	const {jx,DOM}=require('../scripts/utilities.js');

//	Environment

	var	form, controls, forms, buttons, footer, footerPath, footerMessage, files, tabs, server, test, searchForm, about, doShowAbout, popup=undefined,
		searchData={string: '', fromIndex: 0};
	var platform=process.platform;
	var os=require('os');
	var hosts={
		darwin: '/etc/hosts',
		win32: 'C:\\Windows\\System32\\drivers\\etc\\hosts'
	};
	var servers={
		xampp:	{
			darwin: {
				conf: '/Applications/XAMPP/etc/httpd.conf',
				vhosts: '/Applications/XAMPP/xamppfiles/etc/extra/httpd-vhosts.conf',
				htdocs:	'/Applications/XAMPP/xamppfiles/htdocs',
				mysql:	'/Applications/XAMPP/xamppfiles/var/mysql',
			},
			win32: {
				conf: 'C:/xampp/apache/conf/httpd.conf',
				vhosts: 'C:/xampp/apache/conf/extra/httpd-vhosts.conf',
				htdocs:	'C:/xampp/htdocs/',
				mysql:	'C:/xampp/mysql/data',
			},
			vhost: ''
		},
		mamp:	{
			darwin: {
				conf: '/Applications/MAMP/conf/apache/httpd.conf',
				vhosts: '/Applications/MAMP/conf/apache/extra/httpd-vhosts.conf',
				htdocs:	'/Applications/XAMPP/xamppfiles/htdocs',
				mysql:	'/Applications/MAMP/db/mysql57',
			},
			win32: {
				conf: 'C:/MAMP/conf/apache/httpd.conf',
				vhosts: 'C:/MAMP/bin/apache/conf/extra/httpd-vhosts.conf',
				htdocs:	'C:/MAMP/htdocs/',
				mysql:	'C:/MAMP/db/mysql',
			},
			vhost: '',
		},
		ampps:	{
			darwin: {
				conf: '/Applications/AMPPS/apache/conf/httpd.conf',	//	Actual
//				conf: '/Applications/AMPPS/conf/httpd.conf',		//	Source
				vhosts: '/Applications/AMPPS/apache/conf/extra/httpd-vhosts.conf',
				htdocs:	'/Applications/AMPPS/apache/htdocs',
				mysql:	'/Applications/AMPPS/var/',
			},
			win32: {
				conf: 'C:/xampp/apache/conf/httpd.conf',
				vhosts: 'C:/xampp/apache/conf/extra/httpd-vhosts.conf',
				htdocs:	'C:/XAMPP/htdocs/',
				mysql:	'C:/Program Files (x86)/Ampps/mysql/data',
			},
			vhost: ''
		},
	};

	servers.xampp.vhost=fs.readFileSync(path.join(__dirname, '../data/xampp.vhost')).toString().normaliseBR(os.EOL);
	servers.mamp.vhost=fs.readFileSync(path.join(__dirname, '../data/mamp.vhost')).toString().normaliseBR(os.EOL);

	module.exports={os,platform,hosts,servers,setLineNumbers,server,test};

//	Main Process

	main();

	function main() {
		form=tab=0;
		forms=document.querySelectorAll('div#forms>form');
		controls=document.querySelector('form#controls');

		//	Controls

			controls.elements['server'].onfocus=function(event) {
				this.setAttribute('size',this.options.length);
			};
			controls.elements['server'].onchange=function(event) {
				this.blur();
			};
			controls.elements['server'].onblur=function(event) {
				this.removeAttribute('size',this.options.length);
			};

			controls.elements['server'].addEventListener('change',function(event) {
				server=this.value;
				if(server) {
					tabs[1].path=servers[server][platform]['conf'];
					load(1);
					tabs[2].path=servers[server][platform]['vhosts'];
					load(2);

					document.querySelectorAll('label.server').forEach(element=>{element.style.display='none';});
					document.querySelectorAll(`label.${server}`).forEach(element=>{element.style.display='block';});
				}
				module.exports.server=server;
			});

		//	Tab Buttons

			buttons=document.querySelectorAll('form#controls>div#tabs>button');
			buttons.forEach(button=>button.onclick=select.bind(button,button));

			function select(button,event) {
				event.preventDefault();
				tab=parseInt(button.value)||0;
				forms.forEach(f=>f.classList.remove('selected'));
				forms[tab].classList.add('selected');
				buttons.forEach(b=>b.classList.remove('selected'));
				button.classList.add('selected');
				if(tabs[tab].path!==undefined)
				footerPath.innerHTML=tabs[tab].path;
				message(tab);
			}

			tabs=[
				{title: 'Hosts File', path: hosts[platform], prefix: 'hosts', save: 'Save Hosts File', message: 'Opened', status: ''},
				{title: 'httpd.conf', path: '', prefix: 'httpd', save: 'Save httpd conf', message: 'Open httpd.conf file or Select Server', status: ''},
				{title: 'vhosts.conf', path: '', prefix: 'vhosts', save: 'Save vhosts conf', message: 'Open vhosts.conf file or Select Server', status: ''},
				{title: 'Generator', path: '', message: 'Enter Values to Generate Virtual Host'},
				{title: 'Miscellaneous File', path: '', message: 'Open Any File', status: ''},
				{title: 'Miscellaneous Actions', path: '', message: 'Miscellenous Actions', status: ''},
			];

		//	Forms

			forms.forEach((f,i)=>{
				if(f.elements['content']){
					tabs[i].content=f.elements['content'];
					f.elements['content'].onkeydown=handleTab;
					f.elements['content'].addEventListener('input',function(event) {
						message(tab,'Edited','edited');
					});
					f.elements['content'].addEventListener('blur',function(event) {
						searchData.fromIndex=this.selectionStart;
					});

					var lineNumbers=document.createElement('div');
					lineNumbers.classList.add('line-numbers');
					tabs[i].lineNumbers=lineNumbers;
					tabs[i].content.insertAdjacentElement('beforebegin',lineNumbers);
					tabs[i].content.onscroll=function(event) {
						tabs[i].lineNumbers.scrollTop=this.scrollTop;
					};
					tabs[i].content.addEventListener('input',function(event) {
						setLineNumbers(i);
					});
					setLineNumbers(i);
				}
			});

		//	Special Actions
			var miscActions=document.querySelector('form#misc-actions');
			miscActions.elements['reset-mysql'].onclick=function(event) {
				if(!servers[server]) return;
				var files=['ib_logfile0','ib_logfile1','mysql-bin.index'];
				files.forEach(file=>{
					var filepath=`${servers[server][platform].mysql}/${file}`;
					if(fs.existsSync(filepath));
						fs.unlink(filepath, (error) => {
					        if (error) {
								console.log(`${filepath} not found`);
					            return;
					        }
					        console.log(`${filepath} deleted`);
					    });


				});
			};

		//	Footer

			footer=document.querySelector('footer');
			footerPath=document.querySelector('p#path');
			footerMessage=document.querySelector('p#message');

		//	Search

			searchForm=document.querySelector('form#search');
			searchForm.elements['find'].onclick=newSearch;

		//	About etc

			about=document.querySelector('div#about');
			jx.draggable(about);
			doShowAbout=jx.popup(about,null,{escape: true});
	}
	//	Activate

		load(0);
		message(1);
		message(2);

	if(DEVELOPMENT) {
		buttons[5].click();
		controls.elements['server'].value='xampp';
		controls.elements['server'].dispatchEvent(new Event('change'));
		window.webContents.openDevTools();
	}
	else buttons[0].click();

/*
	ipcRenderer.on('TEST',(event,data)=>{
		console.log('TEST');
		console.log(data);
		console.log(188);
	});
*/
	function doAbout(file) {
/*
		if(!popup) popup=new BrowserWindow({
//			parent: window,
			width: 800, height: 800,
			webPreferences: {
//				nodeIntegration: false,
//				preload: path.join('file://', app.getAppPath(), `/scripts/popup.js`)
				preload: path.join(__dirname,'/popup.js')
			}
		});

console.log(path.join(__dirname,'/popup.js'))
		popup.loadURL(path.join('file://', app.getAppPath(), `/content/popup.html`));
console.log(204)
		popup.webContents.on('dom-ready', function() {
			console.log(206)
			popup.send('WHATEVER','hello');
			console.log(208)
		});

		popup.on('close',()=>{popup=undefined;});
*/

		fs.readFile(path.join(app.getAppPath(),`content/${file}.html`), (err, data) => {
			about.innerHTML=data.toString();
			doShowAbout();
		});
	}


//	Support Functions
	function message(t,value,status) {
		if(status!==undefined) tabs[t].status=status;
		if(value) tabs[t].message=value;
		if(t==tab) {
			footerPath.innerHTML=tabs[t].path;
			footerMessage.innerHTML=tabs[tab].message;
			footerMessage.setAttribute('data-status',tabs[tab].status);
			buttons[tab].setAttribute('data-status',tabs[tab].status);
		}
	}

	function setLineNumbers(tab) {
		var lines=tabs[tab].content.value.split(/\r?\n/).length;
		tabs[tab].lineNumbers.textContent=Array.from({length: lines},(v,i)=>i+1).join('\n');
	}

//	Tabs

	function handleTab(event) {
		if(event.key=='Tab') {
			var start=this.selectionStart;
			this.value=this.value.substring(0,start)+'\t'+this.value.substring(this.selectionEnd);
			this.setSelectionRange(start+1,start+1);
			message(tab,'Edited','edited');
			event.preventDefault();
			return true;
		}
		else return true;
	}

//	Open File

	function openDialog() {
		dialog.showOpenDialog({
			title: tabs[tab].title,
			defaultPath: tabs[tab].path
		},function(filePaths){
			tabs[tab].path=filePaths.toString();
			load(tab);
		});
	}

//	Load File

	function load(tab) {
		if(tabs[tab].path) fs.readFile(tabs[tab].path, (err, data) => {
			if(err) {
				console.log(err);
				return;
			}
			data=data.toString();
			forms[tab].elements['content'].value=data;
			message(tab,'Opened','opened');
			setLineNumbers(tab);
		});
		else message(tab,'oops','');
	}

//	Save File with Permission

	function saveFile() {

	}


//	Save Existing File

	function save() {
		if(!tabs[tab].path) return;
		var command;
		var data=forms[tab].elements['content'].value.trim()+'\n';
		if(platform=='win32') data=data.split(/\r?\n/).join('\r\n');

		fs.writeFile(tabs[tab].path,data,function(error) {
			if(error) {
				console.log(JSON.stringify(error));
				if(error.errno=-4048) {
					temp.open(tabs[tab].prefix,function(err,info) {
						switch(platform) {
							case 'darwin':	command=`cp -f "${info.path}" "${tabs[tab].path}"`; break;
							case 'win32':	command=`cmd.exe /c copy /y "${info.path}" "${tabs[tab].path}"`; break;
						}
						fs.writeFile(info.fd,data,function(err) {
							sudo.exec(command,{name: tabs[tab].save},function(error,stdout,stderr) {
								if(error) console.log(error);
							});
						});
					});
					message(tab,'Saved','saved');
				}
			}
			else {
				 message(tab,'Saved','saved');
			}
		});
	}

//	Save As New File

	function saveAs() {
		var savePath=dialog.showSaveDialog();
		if(savePath) {
			tabs[tab].path=savePath;
			save();
		}
	}


//	Find

	function newSearch(event) {		if(DEVELOPMENT) console.log('finding …');
		event.preventDefault();
		var string=searchForm.elements['text'].value;
		console.log(string);
		searchData={
			string,
			fromIndex: searchForm.elements['text'].selectionStart
		};
		search();
		searchForm.style.display='none';
	}

	function search() {
		if(DEVELOPMENT) console.log(`finding ${searchData.string} …`);
		searchData.fromIndex=jx.findInTextarea(searchData.string,forms[tab].elements['content'],searchData.fromIndex)+1;
	}

	function find() {			if(DEVELOPMENT) console.log('find');
		//	Show Search Form
			searchForm.style.display='block';
//		searchData.fromIndex=document.activeElement.selectionStart||0;
			searchForm.elements['text'].focus();
			searchForm.elements['text'].select();
			document.addEventListener('keydown',unfind);
	}
	function unfind(event) {
//		console.log(event.key);
		if(event.key=='Escape') {
			document.removeEventListener('keydown',unfind);
			searchForm.style.display='none';
		}
	}

	function findAgain() {
		search();
	}

//	IPC

	ipcRenderer.on('DOIT',(event,action,data)=>{
		switch(action) {
			case 'find':
				searchData={
					string: data,
					fromIndex: 1
				};
				search();
				break;
		}
	});

	ipcRenderer.on('MENU',(event,data)=>{
		switch(data) {
			case 'NEW':

				break;
			case 'OPEN':
				openDialog();
				break;
			case 'LOAD':
				load(tab);
				break;
			case 'SAVE':
				save();
				break;
			case 'SAVEAS':
				saveAs();
				break;

			case 'FIND':
				find();
				break;
			case 'FINDAGAIN':
				findAgain();
				break;
			case 'ABOUT':
				doAbout('about');
				break;
			case 'INSTRUCTIONS':
				doAbout('instructions');
				break;
			case 'MISC':
				break;
		}
	});
