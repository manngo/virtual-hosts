//	Development
	const {DEVELOPMENT}=require('../settings.js');

//	Generic

	const iterableProperties={
		enumerable: false,
		value: function * () {
			for(let key in this) if(this.hasOwnProperty(key)) yield this[key];
		}
	};

//	Requires
	const path = require('path');
	const fs = require('fs');
	const fsp = require('fs').promises;
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

	var	form, controls, forms, buttons, footer, footerPath, footerMessage, files, tabs={}, server, test, searchForm, about, doShowAbout, popup=undefined,
		searchData={string: '', fromIndex: 0, caseSensitive: false };
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
				phpini: '/Applications/XAMPP/xamppfiles/etc/php.ini',
				phpmyadmin: '/Applications/XAMPP/xamppfiles/phpmyadmin/',
			},
			win32: {
				conf: 'C:/xampp/apache/conf/httpd.conf',
				vhosts: 'C:/xampp/apache/conf/extra/httpd-vhosts.conf',
				htdocs:	'C:/xampp/htdocs/',
				mysql:	'C:/xampp/mysql/data',
				phpini: 'C:/xampp/php/php.ini',
				phpmyadmin: 'C:/xampp/phpMyAdmin/',
			},
			vhost: ''
		},
		mamp:	{
			darwin: {
				conf: '/Applications/MAMP/conf/apache/httpd.conf',
				vhosts: '/Applications/MAMP/conf/apache/extra/httpd-vhosts.conf',
				htdocs:	'/Applications/XAMPP/xamppfiles/htdocs',
				mysql:	'/Applications/MAMP/db/mysql57',
				phpini: '/Applications/MAMP/bin/php/php{version}/conf/php.ini',
				phpmyadmin: '/Applications/MAMP/bin/phpmyadmin/'
			},
			win32: {
				conf: 'C:/MAMP/conf/apache/httpd.conf',
				vhosts: 'C:/MAMP/bin/apache/conf/extra/httpd-vhosts.conf',
				htdocs:	'C:/MAMP/htdocs/',
				mysql:	'C:/MAMP/db/mysql',
				phpmyadmin: 'C:/MAMP/bin/phpMyAdmin/'
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
				phpini: '/Applications/AMPPS/php/etc/php.ini',
				phpmyadmin: '/Applications/AMPPS/phpmyadmin/'
			},
			win32: {
				conf: 'C:/xampp/apache/conf/httpd.conf',
				vhosts: 'C:/xampp/apache/conf/extra/httpd-vhosts.conf',
				htdocs:	'C:/XAMPP/htdocs/',
				mysql:	'C:/Program Files (x86)/Ampps/mysql/data',
				phpini: '/Applications/AMPPS/php/etc/php.ini',
				phpmyadmin: 'C:/Program Files (x86)/Ampps/phpMyAdmin/',
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
		forms={};
		Object.defineProperty(forms,Symbol.iterator,iterableProperties);

		for(let f of document.querySelectorAll('div#forms>form')) forms[f.id]=f;
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
					tabs['httpd-conf'].path=servers[server][platform]['conf'];
					load('httpd-conf')
					.then(data=>{
						var phpini=servers[server][platform]['phpini'];
						var pattern=/php(\d\.\d+\.\d+)/;
						var version=data.match(pattern);
						if(version && phpini.match('{version}')) {
							phpini=phpini.replace('{version}',version[1]);
						}
						tabs['php-ini'].path=phpini;
						load('php-ini');
					});
					tabs['virtual-hosts'].path=servers[server][platform]['vhosts'];
					load('virtual-hosts');

					document.querySelectorAll('label.server').forEach(element=>{element.style.display='none';});
					document.querySelectorAll(`label.${server}`).forEach(element=>{element.style.display='block';});
				}
				module.exports.server=server;
			});

		//	Tab Buttons

			buttons={};
			Object.defineProperty(buttons,Symbol.iterator,iterableProperties);

			for(let b of document.querySelectorAll('form#controls>div#tabs>button')) {
				b.onclick=select.bind(b,b);
				buttons[b.value]=b;
			}

			function select(button,event) {
				event.preventDefault();
				tab=button.value;
				for(let f of forms) f.classList.remove('selected');
				forms[tab].classList.add('selected');
				for(let button of buttons) button.classList.remove('selected');
				button.classList.add('selected');
				if(tabs[tab].path!==undefined)
				footerPath.innerHTML=tabs[tab].path;
				tabMessage(tab);
			}

			tabs={
				'hosts-file': {title: 'Hosts File', path: hosts[platform], prefix: 'hosts', save: 'Save Hosts File', message: 'Opened', status: ''},
				'httpd-conf': {title: 'httpd.conf', path: '', prefix: 'httpd', save: 'Save httpd conf', message: 'Open httpd.conf file or Select Server', status: ''},
				'virtual-hosts': {title: 'vhosts.conf', path: '', prefix: 'vhosts', save: 'Save vhosts conf', message: 'Open vhosts.conf file or Select Server', status: ''},
				'generator': {title: 'Generator', path: '', message: 'Enter Values to Generate Virtual Host'},
				'php-ini': {title: 'php.ini', path: '', prefix: 'php-ini', save: 'Save php ini file', message: 'Open php.ini file or Select Server', status: ''},
				'misc-text': {title: 'Miscellaneous File', path: '', save: 'Save Miscellaneous File', message: 'Open Any File', status: ''},
				'misc-actions': {title: 'Miscellaneous Actions', path: '', message: 'Miscellenous Actions', status: ''},
			};

		//	Forms

			for(let f of forms) {
				if(f.elements['content']){
					tabs[f.id].content=f.elements['content'];
					f.elements['content'].onkeydown=handleTab;
					f.elements['content'].addEventListener('input',function(event) {
						tabMessage(tab,'Edited','edited');
					});
					f.elements['content'].addEventListener('blur',function(event) {
						searchData.fromIndex=this.selectionStart;
					});

					var lineNumbers=document.createElement('div');
					lineNumbers.classList.add('line-numbers');
					tabs[f.id].lineNumbers=lineNumbers;
					tabs[f.id].content.insertAdjacentElement('beforebegin',lineNumbers);
					tabs[f.id].content.onscroll=function(event) {
						tabs[f.id].lineNumbers.scrollTop=this.scrollTop;
					};
					tabs[f.id].content.addEventListener('input',function(event) {
						setLineNumbers(f.id);
					});
					setLineNumbers(f.id);
				}
			}

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
			miscActions.elements['phpmyadmin-css'].onclick=function(event) {
				if(!servers[server]) return;
				switch(platform) {
					case 'darwin':	//	tabs['misc-text'].path=`${servers[server][platform]['phpmyadmin']}/themes/pmahomme/css/common.css.php`; break;
					case 'win32':	tabs['misc-text'].path=`${servers[server][platform]['phpmyadmin']}/themes/pmahomme/css/theme.css`; break;
				}
				load('misc-text');
				buttons['misc-text'].click();
			};
			miscActions.elements['phpmyadmin-config'].onclick=function(event) {
				if(!servers[server]) return;
				tabs['misc-text'].path=`${servers[server][platform]['phpmyadmin']}/config.inc.php`;
				load('misc-text');
				buttons['misc-text'].click();
			};

		//	Footer

			footer=document.querySelector('footer');
			footerPath=document.querySelector('p#path');
			footerMessage=document.querySelector('p#message');

		//	Search

			searchForm=document.querySelector('form#search');
			searchForm.elements['find'].onclick=newSearch;
			//	searchForm.elements['replace'].onclick=replace;

		//	About etc

			about=document.querySelector('div#about');
			jx.draggable(about);
			doShowAbout=jx.popup(about,null,{escape: true});
	}
	//	Activate

		load('hosts-file');
		tabMessage('httpd-conf')
		.then(()=>tabMessage('virtual-hosts'))
		// .then(()=>tabMessage(0,'Whatever0','Etc0'))
		// .then(()=>tabMessage(1,'Whatever1','Etc1'))
		// .then(()=>tabMessage(2,'Whatever2','Etc2'))
		// .then(()=>tabMessage(3,'Whatever3','Etc3'))
		// .then(()=>tabMessage(4,'Whatever4','Etc4'))
		;

	if(DEVELOPMENT) {
		buttons['misc-actions'].click();
		controls.elements['server'].value='xampp';
		controls.elements['server'].dispatchEvent(new Event('change'));
		window.webContents.openDevTools();
	}
	else buttons['hosts-file'].click();
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
	function tabMessage(t,value,status) {
console.log(`Tab: ${t}\nValue: ${value}\nStatus: ${status}`);
			if(status!==undefined) tabs[t].status=status;
			if(value) tabs[t].message=value;
			if(t==tab) {
				footerPath.innerHTML=tabs[t].path;
				footerMessage.innerHTML=tabs[tab].message;
				footerMessage.setAttribute('data-status',tabs[tab].status);
			}
		return new Promise((resolve,reject)=>{
			resolve();
		});
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
			tabMessage(tab,'Edited','edited');
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

	function readFile(path,action,callback) {
		var test=0;
		fsp
		.readFile(path)
		.then(data=>{
			console.log('ok');
			data=data.toString();
			console.log(path.toString());
			test=23;
		})
		.then(()=>{
			console.log(test);
		})
		.then(()=>{
			return 34;
		})
		.catch(error=>{
			console.log(error);
			return null;
		});
		return 57;
	}

	function testLoad(tab) {
		return new Promise((resolve,reject)=>{
			resolve('hello');
		});
	}

	function load(tab) {
		return new Promise((resolve,reject)=>{
			if(!tabs[tab].path) return;
			fsp
			.readFile(tabs[tab].path)
			.then(data => {
				data=data.toString();
				forms[tab].elements['content'].value=data;
				tabMessage(tab,'Opened','opened');
				setLineNumbers(tab);
				resolve(data);
			})
			.catch(error=>{
				console.log(error);
			});
		});
		// if(tabs[tab].path)
		// 	fsp
		// 	.readFile(tabs[tab].path)
		// 	.then(data => {
		// 		data=data.toString();
		// 		forms[tab].elements['content'].value=data;
		// 		tabMessage(tab,'Opened','opened');
		// 		setLineNumbers(tab);
		// 	})
		// 	.catch(error=>{
		// 		console.log(error);
		// 	});
		// else tabMessage(tab,'oops','');
	}


	function load2(tab) {
testLoad(tab).then(data=>{console.log(data);});
		if(tabs[tab].path) fs.readFile(tabs[tab].path, (error, data) => {
			if(err) {
				console.log(error);
				return;
			}
			data=data.toString();
			forms[tab].elements['content'].value=data;
			tabMessage(tab,'Opened','opened');
			setLineNumbers(tab);
		});
		else tabMessage(tab,'oops','');
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
							var options={name: tabs[tab].save};
							sudo.exec(command,options,function(error,stdout,stderr) {
								if(error) console.log(error);
							});
						});
					});
					tabMessage(tab,'Saved','saved');
				}
			}
			else {
				 tabMessage(tab,'Saved','saved');
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
		console.log(`… ${string}`);
		searchData={
			string,
			fromIndex: searchForm.elements['text'].selectionStart,
			caseSenstive: searchForm.elements['case-sensitive'].checked
		};
		doFind();
		searchForm.style.display='none';
	}

	function doFind() {				if(DEVELOPMENT) console.log(`doFind ${searchData.string} …`);
		searchData.fromIndex=jx.findInTextarea(searchData.string,forms[tab].elements['content'],searchData.fromIndex,searchData.caseSenstive)+1;
	}

	function find() {				if(DEVELOPMENT) console.log('find');
		//	Show Search Form
			searchForm.style.display='flex';
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
		doFind();
	}

	function replace() {

	}

//	IPC

	ipcRenderer.on('DOIT',(event,action,data,more)=>{
		switch(action) {
			case 'find':
				searchData={
					string: data,
					fromIndex: 1,
					caseSensitive: false
				};
				doFind();
				break;
			case 'locate':
				dialog.showOpenDialog({
					title: data,
					defaultPath: tabs[tab].path
				},function(filePaths){
					if(!filePaths) return;
					var location=filePaths.toString();
					location=location.replace(' ','\\ ');
					if(more=='replace') tabs[tab].content.setRangeText(location);
				});
				break;
			case 'special':
				switch(data) {
					case 'sendmail':
						dialog.showOpenDialog({
							title: data,
							defaultPath: tabs[tab].path
						},function(filePaths){
							var location=filePaths.toString();
							searchData={
								string: 'sendmail_path',
								fromIndex: 1,
								caseSensitive: false
							};
							doFind();
						});
						break;
				}
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
