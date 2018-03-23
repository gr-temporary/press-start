const electron = require('electron');

const frontend = require('./frontend');

const
	app = electron.app,
	BrowserWindow = electron.BrowserWindow,
	ipcMain = electron.ipcMain;

const path = require('path');
const url = require('url');

let win;

function createWindow() {
	// Create the browser window.
	win = new BrowserWindow({
		width: 800,
		height: 600
	});

	win.on('closed', () => {
		win = null;
	});

	win.loadURL(url.format({
		pathname: path.join(__dirname, '..', 'frontend', 'index.html'),
		protocol: 'file:',
		slashes: true
	}));

	//win.webContents.openDevTools();

	frontend.init(win);
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		frontend.stop();
		//app.quit();
	}
});

app.on('activate', () => {
	if (win === null) {
		createWindow();
	}
});