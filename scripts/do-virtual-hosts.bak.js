/*	Do Virtual Hosts
	================================================ */
//	document.addEventListener('DOMContentLoaded',doVirtualHosts,false);
//	const { dialog } = require('electron').remote;
	const { ipcRenderer, shell} = require('electron');

	var editHosts=require('./edit-virtual-hosts.js');
	var {os,hosts,servers,setLineNumbers,platform,test,server}=editHosts;

	doVirtualHosts();

	function doVirtualHosts() {
		var form=document.querySelector('form#generator');
		form.elements['path'].onclick=function(event) {
			ipcRenderer.send('open-path',{
				title: 'Title',
				defaultPath: '/Volumes',
			},'generator-path');

		};

		ipcRenderer.on('generator-path',(event,result)=>{
		//	var data = result;
			console.log(result);
			if(!result.cancelled) form.elements['root'].value=result.filePaths[0].toString();
		});

		form['generate'].onclick=form['content'].onclick=doit;
		//	Restore Values
			var data=localStorage.getItem('data');
			if(data) {
				data=JSON.parse(data);
				for(var field in data) form[field].value=data[field];
			}

		function doit(event) {
			event.preventDefault();
			if(!editHosts.server) return;
			var vhost=servers[editHosts.server].vhost;
			vhost=vhost.sprintf({
				htdocs: servers[editHosts.server][editHosts.platform].htdocs,
				project: form.elements.project.value,
				domain: form.elements.domain.value,
				root: form.elements.root.value,
			});
			form['content'].value=vhost;
			setLineNumbers('generator');
		}
	}
