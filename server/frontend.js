const electron = require('electron');
const ipcMain = electron.ipcMain;

const path = require('path');

const staticServer = require('./static-server.js');
const socketServer = require('./socket-server.js');

const bus = require('./bus.js');
const fs = require('fs');

let gameWindow;

function listRoms(sender) {
	let frontendPath = path.join(__dirname, '..', 'frontend');
	let roms = fs.readdirSync(path.join(frontendPath, 'roms'));
	let names = roms.map(x => x.replace(/\.nes$/i, ''));
	let result = [];
	names.forEach(x => {
		let img = path.join(frontendPath, 'img', x + '.png');
		let image = fs.existsSync(img) ? x + '.png' : 'NES Test.png';
		result.push({
			name: x,
			rom: x + '.nes',
			preview: image 
		});
	});
	sender.send("rom-list", result);
}

function sendKeys(data) {
	gameWindow.webContents.send('player-keys', data);
}

function sendType(data) {
	gameWindow.webContents.send('player-type', data);
}

function updatePlayers(data) {
	gameWindow.webContents.send('player-data', data);
}

function init() {
	staticServer.run();
	socketServer.init(staticServer.get());

	ipcMain.on('ready', (event) => {
		bus.emit('fetch-players');
	});
	ipcMain.on('get-roms', (event) => {
		listRoms(event.sender);
	});
	ipcMain.on('get-rom-path', (event) => {
		event.sender.send('rom-path', path.join(process.cwd(), "frontend", "roms"));
	});

	bus.on('player-keys', sendKeys);
	bus.on('player-type', sendType);
	bus.on('update-players', updatePlayers);
}

let frontend = {
	init: function(win) {
		gameWindow = win;
		
		init();
	},
	stop: function(callback) {
		staticServer.stop();
	}
};

module.exports = frontend;