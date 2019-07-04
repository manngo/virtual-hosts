/*	Do Virtual Hosts
	================================================ */
//	document.addEventListener('DOMContentLoaded',doVirtualHosts,false);
	const { dialog } = require('electron').remote;

	var editHosts=require('./edit-virtual-hosts.js');
	var {os,hosts,servers,setLineNumbers,platform,test,server}=editHosts;

	doVirtualHosts();
	function doVirtualHosts() {
		var form=document.querySelector('form#generator');
		form.elements['path'].onclick=function(event) {
			event.preventDefault();
			dialog.showOpenDialog({
				properties: ['openDirectory']
			},filePaths=>{
		//		console.log(filePaths.toString());
				form.elements['root'].value=filePaths.toString();
			});
		};
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
				htdocs: servers[editHosts.server].htdocs,
				project: form.elements.project.value,
				domain: form.elements.domain.value,
				root: form.elements.root.value,
			});
			form['content'].value=vhost;
			setLineNumbers('generator');
		}
	}
