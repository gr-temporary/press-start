
const bus = require('./bus.js');

class Player {
	constructor(socket) {
		this.keys = {
			up: false,
			down: false,
			left: false,
			right: false,
			a: false,
			b: false,
			select: false,
			start: false,
			pause: false
		};
		this.primary = false;
		this.type = 'unknown';

		this.socket = socket;
		this.id = socket.id;

		this.socket.on('keyup', (key) => this.keyup(key));
		this.socket.on('keydown', (key) => this.keydown(key));
		this.socket.on('keys', (keys) => this.setKeys(keys));
		this.socket.on('type', (type) => this.updateType(type));
	}

	updateType(type) {
		console.log(type);
		this.type = type.os;
		bus.emit('player-type', { player: this.id, type: this.type });
	}

	updateState() {
		this.socket.emit('primary', this.primary);
	}

	setKeys(keys) {
		for(let i in keys) {
			this.keys[i] = keys[i];
		}
		bus.emit('player-keys', { player: this.id, keys: keys });
	}

	keydown(key) {
		this.keys[key] = true;
	}

	keyup(key) {
		this.keys[key] = false;
	}
}

module.exports = Player;