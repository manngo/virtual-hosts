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
	//	const electron=require('electron');
	const { electron, ipcRenderer, shell, clipboard } = require('electron');
	const path = require('path');
	const fs = require('fs');
	const fsp = require('fs').promises;
	const sudo = require('sudo-prompt');
	const temp=require('temp').track();
//	const BrowserWindow = require('browser-window');

	const {jx, DOM, JSONFile}=require('../scripts/utilities.js');

//	Environment

	const home = ipcRenderer.sendSync('home');
	const appPath = ipcRenderer.sendSync('app-path');
	const package = JSON.parse(fs.readFileSync(`${appPath}/package.json`,'utf8'));

	var jf = new JSONFile();


	var	form, controls, forms, buttons,
		footer, footerPath, footerMessage,
		files, tabs={}, server, test,
		about, doShowAbout, popup=undefined,
		searchForm, searchData={string: '', fromIndex: 0, caseSensitive: false };
	var platform=process.platform;
	var os=require('os');

	var {hosts, servers} = JSON.parse(fs.readFileSync(`${appPath}/data/servers.json`,'utf8'));

	var serverRoot = undefined;

	servers.xampp.vhost = fs.readFileSync(path.join(__dirname, '../data/xampp.vhost')).toString().normaliseBR(os.EOL);
	servers.xampp.vhostdefault = fs.readFileSync(path.join(__dirname, '../data/xampp-default.vhost')).toString().normaliseBR(os.EOL);
	servers.mamp.vhost = fs.readFileSync(path.join(__dirname, '../data/mamp.vhost')).toString().normaliseBR(os.EOL);
	servers.mamp.vhostdefault = fs.readFileSync(path.join(__dirname, '../data/mamp-default.vhost')).toString().normaliseBR(os.EOL);

//	module.exports={os,platform,hosts,servers,setLineNumbers,server,test};

	var customstyle = document.createElement('style');
	window.document.head.insertAdjacentElement('beforeend',customstyle);
	if(platform=='darwin') {
		customstyle.sheet.insertRule('li.macos { display: list-item; }');
	}

//	Main Process

	main();

	function main() {

		form=tab=0;
		forms={};
		Object.defineProperty(forms,Symbol.iterator,iterableProperties);

		for(let f of document.querySelectorAll('div#forms>form')) forms[f.id]=f;
		controls=document.querySelector('form#controls');

		//	Saved State
			jf.init(`${home}/.edit-virtual-hosts.json`)
			.then(()=>jf.read())
			.then(()=>{
				var settings = jf.data;
				if(settings["server-root"]) controls.elements["server-root"].value = settings["server-root"];
				if(settings["server"]) controls.elements["server"].value = settings["server"];
			})
			;

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

			controls.elements['server-path'].onclick=function(event) {	//	button
				event.preventDefault();
				ipcRenderer.send('open-path',{
					title: 'Select Server Path',
					defaultPath: localStorage.getItem('serverPath') || '/',
				},'server-path');
			};
			ipcRenderer.on('server-path',(event,result)=>{
				if(result.canceled) return;
				var path = result.filePaths[0].toString();
				controls.elements['server-root'].value = path;
				localStorage.setItem('serverPath',path);
				controls.elements['server'].value = '';
				jf.write({"server-root":controls.elements['server-root'].value, server: ''});
			});

			controls.elements['server-root'].addEventListener('input', event => {
				event.preventDefault();
				controls.elements['server'].value = '';
				//	serverRoot = event.target.value;
			});
			controls.elements['server-root'].addEventListener('change', event => {
				jf.write({"server-root":controls.elements['server-root'].value, server: ''});
			});


			controls.elements['server'].addEventListener('change',function(event) {
				server=this.value;
				jf.write({ server: controls.elements['server'].value});

				//	TODO: Verify change if data-status is unsaved

				tabs['php-ini'].button.removeAttribute('data-status');
				tabs['httpd-conf'].button.removeAttribute('data-status');
				tabs['virtual-hosts'].button.removeAttribute('data-status');

				if(server) doit();
				else {
					forms['php-ini'].elements['content'].value='';
					tabs['php-ini'].path = '';
					tabMessage('php-ini','','');
					forms['httpd-conf'].elements['content'].value='';
					tabs['httpd-conf'].path = '';
					tabMessage('httpd-conf','','');
					forms['virtual-hosts'].elements['content'].value='';
					tabs['virtual-hosts'].path = '';
					tabMessage('virtual-hosts','','');
				}
				function doit() {
					serverRoot = controls.elements['server-root'].value || servers[server][platform]['root'];
					tabs['httpd-conf'].path = serverRoot + servers[server][platform]['conf'];
					load('httpd-conf')
					.then(data=>{
						var phpini = serverRoot+servers[server][platform]['phpini'];
						var pattern=/php(\d\.\d+\.\d+)/;
						var version=data.match(pattern);
						if(version && phpini.match('{version}')) {
							phpini=phpini.replace('{version}',version[1]);
						}
						tabs['php-ini'].path=phpini;
						load('php-ini');
					});
					tabs['virtual-hosts'].path = serverRoot+servers[server][platform]['vhosts'];
					load('virtual-hosts');

					document.querySelectorAll('label.server').forEach(element=>{element.style.display='none';});
					document.querySelectorAll(`label.${server}`).forEach(element=>{element.style.display='block';});
				}
				//	module.exports.server=server;
			});

		//	Tab Buttons

			buttons={};
			Object.defineProperty(buttons,Symbol.iterator,iterableProperties);

			tabs={
				'hosts-file': {title: 'Hosts File', path: hosts[platform], prefix: 'hosts', save: 'Save Hosts File', message: 'Opened', status: ''},
				'httpd-conf': {title: 'httpd.conf', path: '', prefix: 'httpd', save: 'Save httpd conf', message: 'Open httpd.conf file or Select Server', status: ''},
				'virtual-hosts': {title: 'vhosts.conf', path: '', prefix: 'vhosts', save: 'Save vhosts conf', message: 'Open vhosts.conf file or Select Server', status: ''},
				'generator': {title: 'Generator', path: '', message: 'Enter Values to Generate Virtual Host'},
				'php-ini': {title: 'php.ini', path: '', prefix: 'php-ini', save: 'Save php ini file', message: 'Open php.ini file or Select Server', status: ''},
				'misc-text': {title: 'Miscellaneous File', path: '', save: 'Save Miscellaneous File', message: 'Open Any File', status: ''},
				'misc-actions': {title: 'Miscellaneous Actions', path: '', message: 'Miscellenous Actions', status: ''},
			};

			for(let b of document.querySelectorAll('form#controls>div#tabs>button')) {
				b.onclick=select.bind(b,b);
				buttons[b.value]=b;
				tabs[b.value].button = b;
			}

			function select(button,event) {
				event.preventDefault();
				tab=button.value;
				for(let f of forms) f.classList.remove('selected');
				forms[tab].classList.add('selected');
				for(let b of buttons) b.classList.remove('selected');
				button.classList.add('selected');
				if(tabs[tab].path!==undefined)
					footerPath.innerHTML=tabs[tab].path;
				tabMessage(tab);
			}

		//	Forms

			for(let f of forms) {
				if(f.elements['content']){
					tabs[f.id].content=f.elements['content'];
					f.elements['content'].onkeydown=handleTab;
					f.elements['content'].oninput=function(event) {
						tabs[tab].button.setAttribute('data-status','edited');
						tabMessage(tab,'Edited','edited');
					};
					f.elements['content'].onblur=function(event) {
						searchData.fromIndex=this.selectionStart;
					};

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
					var filepath=`${serverRoot}${servers[server][platform].mysql}/${file}`;
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
					case 'darwin':	//	tabs['misc-text'].path=`${serverRoot}${servers[server][platform]['phpmyadmin']}/themes/pmahomme/css/common.css.php`; break;
					case 'win32':	//	tabs['misc-text'].path=`${serverRoot}${servers[server][platform]['phpmyadmin']}/themes/pmahomme/css/theme.css`; break;
					default:	tabs['misc-text'].path=`${serverRoot}${servers[server][platform]['phpmyadmin']}/js/vendor/codemirror/lib/codemirror.css`;
				}
				load('misc-text');
				buttons['misc-text'].click();
			};
			miscActions.elements['phpmyadmin-config'].onclick=function(event) {
				if(!servers[server]) return;
				tabs['misc-text'].path=`${serverRoot}${servers[server][platform]['phpmyadmin']}/config.inc.php`;
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
			searchForm.style.display='none';

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

		fs.readFile(path.join(appPath,`content/${file}.html`), (err, data) => {
			about.innerHTML=data.toString();
			about.querySelector('h2').innerHTML+=` ${package.version}`;
			doShowAbout();
		});
	}


//	Support Functions
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

//	Tab Key
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
		ipcRenderer.send('open-file',{
			title: 'Title',
//			defaultPath: localStorage.getItem('defaultPath'),
		},'open-file');
		ipcRenderer.on('open-file',(event,result)=>{
			if(result.canceled) return;
			var path = result.filePaths[0].toString();
			//	open file
			tabs['misc-text'].path = path;
			load('misc-text');
			buttons['misc-text'].click();
		});
	}


//	Load File
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
					tabs[tab].button.removeAttribute('data-status');
					tabMessage(tab,'Saved','saved');
				}
			}
			else {
				tabs[tab].button.removeAttribute('data-status');
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

	function doFind() {
		console.log(`doFind ${searchData.string} …`);
		var {string,fromIndex,caseSensitive} = searchData;
		searchData.fromIndex=jx.findInTextarea(string,forms[tab].elements['content'],fromIndex,caseSensitive)+1;
	}

	function find() {				console.log('find');
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

//	IPC DOIT Actions
	ipcRenderer.on('DOIT',(event,action,data,more)=>{
console.log(action);
console.log(data);
console.log(more);
		switch(action) {
			case 'find':
				searchData={
					string: data,
					fromIndex: 0,
					caseSensitive: false
				};
				doFind();
				break;
			case 'open':
				ipcRenderer.send('open-file',{
					title: 'Title',
					defaultPath: tabs[tab].path,
				},'sendmail-path');
				ipcRenderer.on('sendmail-path',(event,result)=>{
					console.log(result);
					if(result.canceled) return;
					var path = result.filePaths[0].toString();
					clipboard.writeText(path);
				});
				break;
		}
	});

	ipcRenderer.on('open-file-paths',(event,result)=>{
		if(result.canceled) return;
		var pd = pathDetails(result.filePaths[0]);
		localStorage.setItem('defaultPath',pd.path);
		state['default-path'] = pd.path;
		updateState();
		result.filePaths.forEach(f=>{
			openFile(f,true);
		});
	});

//	IPC MENU
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

/*	Do Virtual Hosts
	================================================ */

	var form=document.querySelector('form#generator');
	localStorage.setItem('defaultPath',home);
	form.elements['path'].onclick=function(event) {
		event.preventDefault();
		ipcRenderer.send('open-path',{
			title: 'Document Root',
			defaultPath: localStorage.getItem('defaultPath'),
		},'generator-path');
	};
	ipcRenderer.on('generator-path',(event,result)=>{
		if(result.canceled) return;
		var path = result.filePaths[0].toString();
		form.elements['root'].value = path;
		localStorage.setItem('defaultPath',path);
	});

	form['generate'].onclick = form['content'].onclick = function doit(event) {
		event.preventDefault();
		if(!server) return;
		var vhostdefault = form['vhost-default'].checked ? servers[server].vhostdefault+os.EOL+os.EOL : '';
		vhost=vhost.sprintf({
			htdocs: serverRoot+servers[server][platform].htdocs
		});
		var vhost = vhostdefault+servers[server].vhost;
		vhost=vhost.sprintf({
			project: form.elements.project.value,
			domain: form.elements.domain.value,
			root: form.elements.root.value,
		});
		form['content'].value = vhost;
		setLineNumbers('generator');
	};
