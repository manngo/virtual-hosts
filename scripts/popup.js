console.log(1);
const { ipcRenderer } = require('electron');
console.log(3);
ipcRenderer.on('WHATEVER', (event, data) => {
	console.log(4);
	console.log(`preload: received ${data}`);
	ipcRenderer.send('TEST', 'from here');
});
