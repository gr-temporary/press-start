const electron = require('electron');

const
	app = electron.app,
	BrowserWindow = electron.BrowserWindow,
	ipcMain = electron.ipcMain;

const ip = require('ip');

const path = require('path');
const url = require('url');

let win;

function updateAddress() {
	let addr = ip.address();
	win.webContents.send("ip-address", addr);
}

function createWindow() {
	// Create the browser window.
	win = new BrowserWindow({
		width: 800,
		height: 600
	});

	win.on('closed', () => {
		// Разбирает объект окна, обычно вы можете хранить окна     
		// в массиве, если ваше приложение поддерживает несколько окон в это время,
		// тогда вы должны удалить соответствующий элемент.
		win = null;
	})

	// и загрузит index.html приложение.
	win.loadURL(url.format({
		pathname: path.join(__dirname, '..', 'frontend', 'index.html'),
		protocol: 'file:',
		slashes: true
	}));

	win.webContents.openDevTools();

	ipcMain.on('ready', (event) => {
		updateAddress();
	});
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
	// На macOS это обычно для приложений и их строки меню   
	// оставаться активным до тех пор, пока пользователь не выйдет явно с помощью Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit()
	}
});

app.on('activate', () => {
	// На MacOS это общее для того чтобы создать окно в приложении, когда значок 
	// dock нажали и нет других открытых окон.
	if (win === null) {
		createWindow()
	}
});