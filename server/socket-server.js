
const staticServer = require('./static-server.js');
const io = require('socket.io');
const Player = require('./player.js');
const bus = require('./bus.js');

let socketServer;

let playerQueue = [];
let playerMap = {};

function userDisconnected(socket) {
	console.log("Player removed");
	removePlayer(playerMap[socket.id]);
}

function updateQueue() {
	playerQueue.forEach((p, i) => {
		p.primary = i == 0;
		p.updateState();
	});
	bus.emit('update-players', {
		players: playerQueue.map(x => ({ id: x.id, type: x.type })).slice(0, 2)
	});
}

function addPlayer(player) {
	console.log("Player added");
	playerQueue.push(player);
	playerMap[player.id] = player;

	updateQueue();
}

function removePlayer(player) {
	delete playerMap[player.id];
	let i = playerQueue.findIndex(p => p.id == player.id);
	playerQueue.splice(i, 1);

	updateQueue();
}

function userConnected(socket) {

	let player = new Player(socket);
	addPlayer(player);

	socket.on('disconnect', () => {
		userDisconnected(socket);
	});
}

function init(httpServer) {
	socketServer = io(httpServer);

	console.log("Socket server listening");

	socketServer.on('connection', socket => {
		userConnected(socket);
	});

	bus.on('fetch-players', updateQueue);
}

module.exports = {
	init: init
};