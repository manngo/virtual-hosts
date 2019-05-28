	// document.addEventListener('DOMContentLoaded',main,false);

//	Requires
	const path = require('path');
	const fs = require('fs');
	const { ipcRenderer} = require('electron');
	const { dialog } = require('electron').remote;
	const sudo = require('sudo-prompt');
	const window=require('electron').remote.getCurrentWindow();

//	Environment

	var form, controls, forms, buttons, footer, footerPath, footerMessage, files, tabs, platform, test;
	var os=process.platform;

	var hosts={
		darwin: '/etc/hosts',
		win32: 'C:\\Windows\\System32\\drivers\\hosts'
	};
	var platforms={
		xampp:	{
			darwin: {
				conf: '/Applications/XAMPP/etc/httpd.conf',
				vhosts: '/Applications/XAMPP/xamppfiles/etc/extra/httpd-vhosts.conf',
				htdocs:	'/Applications/XAMPP/xamppfiles/htdocs',
			},
			win32: {
				conf: 'C:/xampp/apache/conf/httpd.conf',
				vhosts: 'C:/xampp/apache/conf/conf/extra/httpd-vhosts.conf',
				htdocs:	'C:/XAMPP/htdocs/',
			},
			vhost: '#\tXAMPP\tRequired Default\n\t<VirtualHost *:80>\n\tServerName localhost\n\tDocumentRoot "[htdocs]"\n\t<Directory "[htdocs]">\n\t\tOptions Indexes FollowSymLinks Includes execCGI\n\t\tAllowOverride All\n\t\tRequire all granted\n\t\t</Directory>\n\t</VirtualHost>\n\n#\t[project]: [domain]\n\t<VirtualHost *:80>\n\t\tServerName [domain]\n\t\tServerAlias [domain]\n\t\tDocumentRoot "[root]"\n\t\tErrorLog logs/[project].log\n\t\tCustomLog logs/[project].log combined\n\t\t<Directory "[root]">\n\t\t\tOptions FollowSymLinks Indexes\n\t\t\tAllowOverride All\n\t\t\tRequire all granted\n\t\t</Directory>\n\t</VirtualHost>'
		},
		mamp:	{
			darwin: {
				conf: '/Applications/MAMP/conf/apache/httpd.conf',
				vhosts: '/Applications/MAMP/conf/apache/extra/httpd-vhosts.conf',
				htdocs:	'/Applications/XAMPP/xamppfiles/htdocs',
			},
			win32: {
				conf: 'C:/MAMP/conf/apache/httpd.conf',
				vhosts: 'C:/MAMP/bin/apache/conf/extra/httpd-vhosts.conf',
				htdocs:	'C:/XAMPP/htdocs/',
			},
			vhost: '#\tMAMP\t[project]: [domain]\n\tNameVirtualHost *:80\n\n\t<VirtualHost *:80>\n\t\tServerName [domain]\n\t\tServerAlias [domain]\n\t\tDocumentRoot "[root]"\n\t\tServerAdmin webmaster@www.example.com\n\t\tErrorLog "logs/[project].log"\n\t\tCustomLog "logs/[project].log" common\n\t\t<directory "[root]">\n\t\t\tOptions Indexes FollowSymLinks\n\t\t\tAllowOverride all\n\t\t\tOrder Deny,Allow\n\t\t\tDeny from all\n\t\t\tAllow from 127.0.0.1\n\t\t</directory>\n\t</VirtualHost>',
		}
	};

	module.exports={os,hosts,platforms,setLineNumbers,platform,test};
	main();



	function main() {
		form=0;
		tab=0;
		forms=document.querySelectorAll('div#forms>form');
		controls=document.querySelector('form#controls');
		buttons=document.querySelectorAll('form#controls>div#tabs>button');
		buttons.forEach(button=>button.onclick=select.bind(button,button));
		footer=document.querySelector('footer');
		footerPath=document.querySelector('footer>p#path');
		footerMessage=document.querySelector('footer>p#message');
		tabs=[
			{title: 'Hosts File', path: hosts[os], status: 'Opened'},
			{title: 'httpd.conf', path: '', status: 'Open httpd.conf file or Select Platform'},
			{title: 'vhosts.conf', path: '', status: 'Open vhosts.conf file or Select Platform'},
			{title: 'Generator', path: '', status: 'Enter Values to Generate Virtual Host'}
		];
		controls.elements['platform'].onchange=function(event) {
			platform=this.value;
			if(platform) {
				tabs[1].path=platforms[platform][os]['conf'];
				load(1);
				tabs[2].path=platforms[platform][os]['vhosts'];
				load(2);
			}
			module.exports.platform=platform;
		};

		function select(button,event) {
			event.preventDefault();
			tab=parseInt(button.value)||0;
			forms.forEach(f=>f.classList.remove('selected'));
			forms[tab].classList.add('selected');
			buttons.forEach(b=>b.classList.remove('selected'));
			button.classList.add('selected');
			footerPath.innerHTML=tabs[tab].path;
//			footerMessage.innerHTML=tabs[tab].status;
			status(tab);
		}
		forms.forEach((f,i)=>{
			tabs[i].content=f.elements['content'];
			f.elements['content'].onkeydown=handleTab;
			f.elements['content'].onkeypress=function(event) {
				status(tab,'Edited');
			};

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
		});

		//	Activate

			load(0);
			status(1);
			status(2);

		buttons[3].click();
//		window.webContents.findInPage('Virtual')
	}

	function doLineNumbers(textarea,className) {
		if(!className) className='line-numbers';
		var container=document.createElement('div');
		container.classList.add(className);

		textarea.insertAdjacentElement('beforebegin',container);
		container.appendChild(textarea);
		var lineNumbers=document.createElement('div');
		textarea.insertAdjacentElement('beforebegin',lineNumbers);
		textarea.onscroll=function(event) {
			lineNumbers.scrollTop=this.scrollTop;
		};
		textarea.addEventListener('input',show);
		function show(event) {
			var lines=textarea.value.split(/\r?\n/).length;
			lineNumbers.textContent=Array.from({length: lines},(v,i)=>i+1).join('\n');
		}
		show();
	}

//	var ta=document.querySelector('textarea'); doLineNumbers(ta);

/*
div.line-numbers {
	border: thin solid red;
	display: flex;
	flex-direction: row;
}
div.line-numbers>div {
	overflow: auto;
	white-space: pre;
	width: 4em;
	box-sizing: border-box;
		white-space: pre;
		width: 4em;
		text-align: right;
		padding-right: .5rem;
		qbackground-color: #eee;
		overflow: auto;
		border-right: thin solid #ccc;
}
div.line-numbers>textarea {
	box-sizing: border-box;
		overflow: auto;
		qwhite-space: nowrap;
}



*/
	function status(t,value) {
		if(value) tabs[t].status=value;
		if(t==tab) {
			footerPath.innerHTML=tabs[t].path;
			footerMessage.innerHTML=tabs[tab].status;
			footerMessage.setAttribute('data-status',tabs[tab].status);
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
			return false;
		}
		else return true;
	}

	function openDialog() {
		dialog.showOpenDialog({
			title: tabs[tab].title,
			defaultPath: tabs[tab].path
		},function(filePaths){
			tabs[tab].path=filePaths.toString();
			load(tab);
		});
	}


	function load(tab) {
		if(tabs[tab].path) fs.readFile(tabs[tab].path, (err, data) => {
			data=data.toString();
			forms[tab].elements['content'].value=data;
			status(tab,'Opened');
			setLineNumbers(tab);
		});
		else status(tab,'oops');
	}

	function save() {
		var data=forms[tab].elements['content'].value.trim();
		switch(tab) {
			case 0:
				sudo.exec(`echo "${data}">${tabs[tab].path}`, {name: 'Edit hosts File'},
					function(error, stdout, stderr) {
						if (error) throw error;
						console.log('stdout: ' + stdout);
					}
				);
				break;
			case 1:
				sudo.exec(`echo "${data}">${tabs[tab].path}`, {name: 'Edit hosts File'},
					function(error, stdout, stderr) {
						if (error) throw error;
						console.log('stdout: ' + stdout);
					}
				);
				break;
			case 2:
				sudo.exec(`echo "${data}">${tabs[tab].path}`, {name: 'Edit hosts File'},
					function(error, stdout, stderr) {
						if (error) throw error;
						console.log('stdout: ' + stdout);
					}
				);
				break;

/*
				fs.writeFile(tabs[tab].path, data, 'utf8', (error) => {
					if (error) throw error;
					console.log('The file has been saved!');
				});
*/
			default:
		}
		status(tab,'Saved');
	}

	ipcRenderer.on('SAVE',(event,data)=>{
		save();
	});
	ipcRenderer.on('LOAD',(event,data)=>{
		load(tab);
	});
	ipcRenderer.on('OPEN',(event,data)=>{
		openDialog();
	});
