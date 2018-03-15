const electron = require('electron');
const ipcMain = electron.ipcMain;

const path = require('path');

const staticServer = require('./static-server.js');
const socketServer = require('./socket-server.js');

const bus = require('./bus.js');

const ip = require('ip');
const fs = require('fs');

let gameWindow;

function updateAddress(sender) {
	let addr = ip.address();
	sender.send("ip-address", addr);
}

function listRoms(sender) {
	let roms = fs.readdirSync(path.join(__dirname, '..', 'roms'));
	sender.send("rom-list", roms);
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
		updateAddress(event.sender);
		bus.emit('fetch-players');
	});

	bus.on('player-keys', sendKeys);
	bus.on('player-type', sendType);
	bus.on('update-players', updatePlayers);
}

let frontend = {
	init: function(win) {
		gameWindow = win;
		
		init();
	}
};

module.exports = frontend;