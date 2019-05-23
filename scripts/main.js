//	Required

	const fs = require('fs');
	const path = require('path');

//	Form

	var form=document.querySelector('form#hosts');


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

	var textarea=form['content'];
	textarea.onkeydown=handleTab;

//	Activate

	fs.readFile('/etc/hosts', (err, data) => {
		form['content'].value=data;
		form.addEventListener('submit', function(e){
		    e.preventDefault();
			var data=form['content'].value.trim();

			var sudo = require('sudo-prompt');
			var options={
				name: 'Electron'
			};
			sudo.exec(`echo "${data}">/etc/hosts`, options,
				function(error, stdout, stderr) {
					if (error) throw error;
					console.log('stdout: ' + stdout);
				}
			);
		});
	});
