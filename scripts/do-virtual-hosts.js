/*	Do Virtual Hosts
	================================================ */
//	document.addEventListener('DOMContentLoaded',doVirtualHosts,false);

	var exported=require('./main.js');
	var {os,hosts,platforms,setLineNumbers,platform,test}=exported;
	doVirtualHosts();
	function doVirtualHosts() {
		var form=document.querySelector('form#generator');
		form['generate'].onclick=form['content'].onclick=doit;
		//	Restore Values
			var data=localStorage.getItem('data');
			if(data) {
				data=JSON.parse(data);
				for(var field in data) form[field].value=data[field];
			}

		function doit(event) {
			event.preventDefault();
			if(!exported.platform) return;
			var vhost=platforms[exported.platform].vhost;
			vhost=vhost.sprintf({
				htdocs: platforms[exported.platform][os].htdocs,
				project: form.elements.project.value,
				domain: form.elements.domain.value,
				root: form.elements.root.value,
			});
			form['content'].value=vhost;
			setLineNumbers(3);
		}
	}
